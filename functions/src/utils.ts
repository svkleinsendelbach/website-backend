import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { AuthData } from 'firebase-functions/lib/common/providers/https';
import * as sha512 from 'js-sha512';
import * as jwt from 'jsonwebtoken';

import { Logger } from './Logger/Logger';
import { ParameterContainer } from './ParameterContainer';
import { jwtPublicRsaKey } from './websiteEditingFunctions/jwt_rsa_keys';

/**
 * Checks if data exists at specified reference.
 * @param {admin.database.Reference} reference Reference to check if there is data.
 * @return {Promise<boolean>} True if data exists at reference.
 */
export async function existsData(reference: admin.database.Reference): Promise<boolean> {
  return (await reference.once('value')).exists();
}

export function checkJWTForEditing(token: string, auth: AuthData | undefined, logger: Logger) {
  logger.append('checkJWTForEditing', { token, auth });
  const tokenPayload = jwt.verify(token, jwtPublicRsaKey) as { userId: string; expiresAt: number };
  if (typeof tokenPayload.expiresAt !== 'number' || new Date(tokenPayload.expiresAt) < new Date())
    throw httpsError('permission-denied', 'Jwt validation failed: Expired.', logger);
  if (auth === undefined) throw httpsError('permission-denied', 'No user authentication for validation jwt.', logger);
  const hashedUid = sha512.sha512(auth.uid);
  if (typeof tokenPayload.userId !== 'string' || tokenPayload.userId !== hashedUid)
    throw httpsError('permission-denied', 'Jwt validation failed: Invalid userId.', logger);
}

export function reference(
  path: string,
  parameterContainer: ParameterContainer,
  logger: Logger,
): admin.database.Reference {
  logger.append('database', { parameterContainer });
  const dbType = parameterContainer.optionalParameter('dbType', 'string', logger.nextIndent);
  switch (dbType) {
    case 'testing':
      return admin
        .app()
        .database('https://svkleinsendelbach-website-tests.europe-west1.firebasedatabase.app/')
        .ref(path);
    default:
      return admin.app().database().ref(path);
  }
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

export enum DBPlayerImageSource {
  inAction = 'inAction',
}

export async function getDBPlayerImageName(
  playerId: number,
  sourceOrder: [DBPlayerImageSource | undefined],
): Promise<string | undefined> {
  const path = `players/${playerId.toString()}/images`;
  const ref = admin.database().ref(path);
  const snapshot = await ref.once('value');
  for (const source of sourceOrder) {
    if (source == undefined) {
      continue;
    }
    const images = snapshot.child(source);
    if (!images.exists() || !images.hasChildren()) {
      continue;
    }
    const imageNames: string[] = [];
    images.forEach(snapshot => {
      const imageName = snapshot.val();
      if (typeof imageName === 'string') {
        imageNames.push(imageName);
      }
    });
    if (imageNames.length == 0) {
      continue;
    }
    const index = Math.floor(Math.random() * imageNames.length);
    return imageNames[index];
  }
  return undefined;
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
