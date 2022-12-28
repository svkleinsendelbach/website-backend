import * as functions from 'firebase-functions';
import { FunctionsErrorCode } from 'firebase-functions/lib/common/providers/https';
import { FirebaseFunction } from './FirebaseFunction';
import { Logger } from './Logger';
import { Result } from './Result';

/**
 * Get the result of a promise:
 *     - Result.success if promise resolves.
 *     - Result.failure if promise rejects.
 * @template T Type of the promise.
 * @param { Promise<T> } promise Promise to get result from.
 * @return { Promise<Result<T, Error>> } Return promise.
 */
export async function toResult<T>(promise: Promise<T>): Promise<Result<FirebaseFunction.Result.Success<T>, FirebaseFunction.Result.Failure>> {
    return promise
        .then(value => Result.success<FirebaseFunction.Result.Success<T>, FirebaseFunction.Result.Failure>({
            state: 'success',
            returnValue: value
        }))
        .catch(reason => Result.failure<FirebaseFunction.Result.Success<T>, FirebaseFunction.Result.Failure>({
            state: 'failure',
            error: convertToFunctionResultError(reason)
        }));
}

/**
 * Check if specified status is a functions error code.
 * @param { string | undefined } status Status to check.
 * @return { boolean } true if status is a functions error code, false otherwise.
 */
function isFunctionsErrorCode(status: string | undefined): status is FunctionsErrorCode {
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
export function convertToFunctionResultError(error: any): FirebaseFunction.Result.Error {
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
