import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

import { Logger } from './Logger/Logger';

/**
 * Checks if data exists at specified reference.
 * @param {admin.database.Reference} reference Reference to check if there is data.
 * @return {Promise<boolean>} True if data exists at reference.
 */
export async function existsData(reference: admin.database.Reference): Promise<boolean> {
  return (await reference.once('value')).exists();
}

/**
 * Returns same value, but null if specified value is undefined.
 * @param {any} value Value to get undefined value.
 * @return {any} Same value, but null if specified value is undefined.
 */
export function undefinedAsNull<T>(value: T | undefined): T | null {
  return value ?? null;
}

export function throwsAsUndefined<T>(func: () => T): T | undefined {
  try {
    return func();
  } catch {
    return undefined;
  }
}

/**
 * Interface for a firebase function with execute function method.
 */
export interface FirebaseFunction<T> {
  /**
   * Executed this firebase function.
   */
  executeFunction(): Promise<T>;
}

/**
 * Builds a firebase function http error.
 * @param {functions.https.FunctionsErrorCode} code Code of http error.
 * @param {string} message Message of the error.
 * @param {Logger | null} logger Logger to get detail message.
 * @returns {functions.https.HttpsError} Firebase function http error.
 */
export function httpsError(
  code: functions.https.FunctionsErrorCode,
  message: string,
  logger?: Logger,
): functions.https.HttpsError {
  return new functions.https.HttpsError(code, message, logger?.joined);
}

declare global {
  interface String {
    red(): string;
    green(): string;
    yellow(): string;
    blue(): string;
    magenta(): string;
    cyan(): string;
    gray(): string;
  }
}

/* eslint-disable space-before-function-paren */
String.prototype.red = function () {
  return `\x1b[31m${this}\x1b[0m`;
};

String.prototype.green = function () {
  return `\x1b[32m${this}\x1b[0m`;
};

String.prototype.yellow = function () {
  return `\x1b[33m${this}\x1b[0m`;
};

String.prototype.blue = function () {
  return `\x1b[34m${this}\x1b[0m`;
};

String.prototype.magenta = function () {
  return `\x1b[35m${this}\x1b[0m`;
};

String.prototype.cyan = function () {
  return `\x1b[36m${this}\x1b[0m`;
};

String.prototype.gray = function () {
  return `\x1b[90m${this}\x1b[0m`;
};

declare global {
  interface Array<T> {
    compactMap<U, This = undefined>(
      callback: (value: T, index: number, array: T[]) => U | undefined | null,
      thisArg?: This,
    ): U[];
  }
}

Array.prototype.compactMap = function <U, This = undefined>(
  callback: (value: any, index: number, array: any[]) => U | undefined | null,
  thisArg?: This,
): U[] {
  return this.flatMap((value, index, array) => {
    return callback(value, index, array) ?? [];
  }, thisArg);
};
