import * as admin from 'firebase-admin';
import { DeleteAllDataFunction } from './functions/DeleteAllDataFunction';
import { FirebaseFunction } from 'firebase-function';
import { getCallSecretKey, getCryptionKeys } from './privateKeys';
import { UserAuthenticationAddFunction } from './functions/UserAuthenticationAddFunction';
import { UserAuthenticationCheckFunction } from './functions/UserAuthenticationCheckFunction';
import { UserAuthenticationAcceptDeclineFunction } from './functions/UserAuthenticationAcceptDeclineFunction';
import { UserAuthenticationGetAllUnauthenticatedFunction } from './functions/UserAuthenticationGetAllUnauthenticatedFunction';
import { EventEditFunction } from './functions/EventEditFunction';
import { EventGetFunction } from './functions/EventGet';

admin.initializeApp();

export const deleteAllData = FirebaseFunction.create((data, auth, logger) => new DeleteAllDataFunction(data, auth, logger), getCryptionKeys, getCallSecretKey);

export const userAuthenticationAdd = FirebaseFunction.create((data, auth, logger) => new UserAuthenticationAddFunction(data, auth, logger), getCryptionKeys, getCallSecretKey);

export const userAuthenticationCheck = FirebaseFunction.create((data, auth, logger) => new UserAuthenticationCheckFunction(data, auth, logger), getCryptionKeys, getCallSecretKey);

export const userAuthenticationAcceptDecline = FirebaseFunction.create((data, auth, logger) => new UserAuthenticationAcceptDeclineFunction(data, auth, logger), getCryptionKeys, getCallSecretKey);

export const userAuthenticationGetAllUnauthenticated = FirebaseFunction.create((data, auth, logger) => new UserAuthenticationGetAllUnauthenticatedFunction(data, auth, logger), getCryptionKeys, getCallSecretKey);

export const eventEdit = FirebaseFunction.create((data, auth, logger) => new EventEditFunction(data, auth, logger), getCryptionKeys, getCallSecretKey);

export const eventGet = FirebaseFunction.create((data, auth, logger) => new EventGetFunction(data, auth, logger), getCryptionKeys, getCallSecretKey);
