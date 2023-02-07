import * as functions from 'firebase-functions';
import { FunctionsErrorCode } from 'firebase-functions/lib/common/providers/https';
import { FirebaseFunction } from './FirebaseFunction';
import { Logger } from './Logger';
import { Result } from './Result';
import { guid } from '../classes/guid';

export type ArrayElement<T> = T extends (infer Element)[] ? Element : never;

/**
 * Get the result of a promise:
 *     - Result.success if promise resolves.
 *     - Result.failure if promise rejects.
 * @template T Type of the promise.
 * @param { Promise<T> } promise Promise to get result from.
 * @return { Promise<Result<T, Error>> } Return promise.
 */
export async function toResult<T>(promise: Promise<T>): Promise<FirebaseFunction.ResultType<T>> {
    return promise
        .then(value => Result.success<T>(value))
        .catch(reason => Result.failure<FirebaseFunction.Error>(convertToFunctionResultError(reason)));
}

/**
 * Check if specified status is a functions error code.
 * @param { string | undefined } status Status to check.
 * @return { boolean } true if status is a functions error code, false otherwise.
 */
export function isFunctionsErrorCode(status: string | undefined): status is FunctionsErrorCode {
    if (status === undefined) return false;
    return [
        'ok', 'cancelled', 'unknown', 'invalid-argument', 'deadline-exceeded', 'not-found', 'already-exists',
        'permission-denied', 'resource-exhausted', 'failed-precondition', 'aborted', 'out-of-range', 'unimplemented',
        'internal', 'unavailable', 'data-loss', 'unauthenticated'
    ].includes(status);
}

/**
 * Convert any error to a firebase function result error.
 * @param { any } error Error to convert.
 * @return { FirebaseFunction.Result.Error } Converted firebase function result error.
 */
export function convertToFunctionResultError(error: any): FirebaseFunction.Error {
    const hasMessage = error.message !== undefined && error.message !== null && error.message !== '';
    const hasStack = error.stack !== undefined && error.stack !== null && error.stack !== '';
    return {
        code: isFunctionsErrorCode(error.code) ? error.code : 'unknown',
        message: hasMessage ? `${error.message}` : 'Unknown error occured, see details for more infos.',
        details: hasMessage ? error.details : error,
        stack: hasStack !== undefined ? `${error.stack}` : undefined
    };
}

/**
 * Returns a function https error with specified code and message.
 * @param { functions.https.FunctionsErrorCode } code Code of the function https error.
 * @param { string } message Message of the function https error.
 * @param { Logger | undefined } logger Logger to get verbose message from.
 * @return { functions.https. } Function https error with specified code and message.
 */
export function httpsError(
    code: functions.https.FunctionsErrorCode,
    message: string,
    logger: Logger | undefined
): functions.https.HttpsError {
    return new functions.https.HttpsError(code, message, logger?.joinedMessages);
}

export function arrayBuilder<T>(elementBuilder: (element: any, logger: Logger) => T, length?: number): (value: object, logger: Logger) => T[] {
    return (value: object, logger: Logger) => {
        if (!Array.isArray(value))
            throw httpsError('internal', 'Parameter has to be an array.', logger);
        if (length !== undefined && value.length !== length)
            throw httpsError('internal', `Length of array has to be ${length}.`, logger);
        return value.map(element => {
            return elementBuilder(element, logger.nextIndent);
        });
    };
}

export namespace Json {
    export function stringify(data: any, space?: string | number): string | undefined {
        if (data === undefined) return undefined;
        return JSON.stringify(data, (_, v) => {
            if (typeof v === 'bigint') return `${v}#bigint`;
            if (v instanceof guid) return v.guidString;
            return v;
        }, space);   
    }
    
    export function parse(data: string | undefined): any {
        if (data === undefined) return undefined;
        // eslint-disable-next-line no-control-regex
        data = data.replace(/[\u0000-\u001F]+/g, '');
        return JSON.parse(data, (_, v) => typeof v === 'string' && v.endsWith('#bigint') ? BigInt(v.replace(/#bigint$/, '')) : v);
    }
}

export function mapObject<T extends Record<string, any>, K extends keyof T, V>(value: T, key: K, mapper: (v: T[K]) => V): { [
    Key in keyof T]: Key extends K ? V : T[Key] 
} {
    const newValue = {} as any;
    for (const entry of Object.entries(value))
        newValue[entry[0]] = entry[0] === key ? mapper(entry[1]) : entry[1];
    return newValue;
}

export type UndefinedValuesAsNull<T> = T extends Record<PropertyKey, any> ? {
    [Key in keyof T]-?: UndefinedValuesAsNull<T[Key]>
} : T extends undefined ? null : T;

export function undefinedValuesAsNull<T>(value: T): UndefinedValuesAsNull<T> {
    if (value === undefined || value === null) return null as any;
    if (typeof value !== 'object') return value as any;
    if (Array.isArray(value)) {
        const newValue = [] as any[];
        for (const element of value)
            newValue.push(undefinedValuesAsNull(element));
        return newValue as any;
    } else {
        const newValue = {} as any;
        for (const entry of Object.entries(value))
            newValue[entry[0]] = undefinedValuesAsNull(entry[1]);
        return newValue;
    }
}

export function modularPower(base: bigint, exponent: bigint, modulus: bigint) {
    if (modulus === 1n) 
        return 0n;
    base %= modulus;
    let result = 1n;
    while (exponent > 0n) {
        if (exponent % 2n === 1n) 
            result = (result * base) % modulus;
        exponent >>= 1n; 
        base = (base ** 2n) % modulus;
    }
    return result;
}

export type Nullable<T> = {
    [P in keyof T]: Nullable<T[P]> | null;
};

export function ensureNotNullable<T>(nullableValue: Nullable<T>, previousKeyPath: string = ''): T {
    if (nullableValue === null)
        throw new Error(`Ensure not null failed: ${previousKeyPath} is null.`);
    if (typeof nullableValue !== 'object' || Array.isArray(nullableValue))
        return nullableValue as T;
    const value: T = {} as T;
    for (const entry of Object.entries(nullableValue)) {
        if (entry[1] === null)
            throw new Error(`Ensure not null failed: ${previousKeyPath}/${entry[0]} is null.`);
        value[entry[0] as keyof T] = ensureNotNullable(entry[1] as any, `${previousKeyPath}/${entry[0]}`);
    }
    return value;
}

declare global {
    export interface String {

        /**
         * Colors the string red.
         */
        red(): string;

        /**
         * Colors the string green.
         */
        green(): string;

        /**
         * Colors the string yellow.
         */
        yellow(): string;

        /**
         * Colors the string blue.
         */
        blue(): string;

        /**
         * Colors the string magenta.
         */
        magenta(): string;

        /**
         * Colors the string cyan.
         */
        cyan(): string;

        /**
         * Colors the string gray.
         */
        gray(): string;
    }

    export interface Array<T> {
      compactMap<U, This = undefined>(
        callback: (value: T, index: number, array: T[]) => U | undefined | null,
        thisArg?: This,
      ): U[];
    }
}

String.prototype.red = function() {
    return `\x1b[31m${this}\x1b[0m`;
};

String.prototype.green = function() {
    return `\x1b[32m${this}\x1b[0m`;
};

String.prototype.yellow = function() {
    return `\x1b[33m${this}\x1b[0m`;
};

String.prototype.blue = function() {
    return `\x1b[34m${this}\x1b[0m`;
};

String.prototype.magenta = function() {
    return `\x1b[35m${this}\x1b[0m`;
};

String.prototype.cyan = function() {
    return `\x1b[36m${this}\x1b[0m`;
};

String.prototype.gray = function() {
    return `\x1b[40m\x1b[2m${this}\x1b[0m`;
};

Array.prototype.compactMap = function <U, This = undefined>(
    callback: (value: any, index: number, array: any[]) => U | undefined | null,
    thisArg?: This,
): U[] {
    return this.flatMap((value, index, array) => {
        return callback(value, index, array) ?? [];
    }, thisArg);
};
