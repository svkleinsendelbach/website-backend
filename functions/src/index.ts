import * as admin from 'firebase-admin';
import { DeleteAllDataFunction } from './functions/DeleteAllDataFunction';
import { FirebaseFunction } from 'firebase-function';
import { getCryptionKeys } from './privateKeys';
import { UserAuthenticationAddFunction } from './functions/UserAuthenticationAddFunction';
import { UserAuthenticationCheckFunction } from './functions/UserAuthenticationCheckFunction';

admin.initializeApp();

export const deleteAllData = FirebaseFunction.create((data, auth) => new DeleteAllDataFunction(data, auth), getCryptionKeys);

export const userAuthenticationAdd = FirebaseFunction.create((data, auth) => new UserAuthenticationAddFunction(data, auth), getCryptionKeys);

export const userAuthenticationCheck = FirebaseFunction.create((data, auth) => new UserAuthenticationCheckFunction(data, auth), getCryptionKeys);
