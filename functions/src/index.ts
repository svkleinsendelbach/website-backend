import * as admin from 'firebase-admin';
import { createFirebaseFunctions } from 'firebase-function';
import { firebaseFunctions } from './firebaseFunctions';
import { getCryptionKeys, getCallSecretKey } from './privateKeys';

admin.initializeApp();

export = createFirebaseFunctions(firebaseFunctions, getCryptionKeys, getCallSecretKey);
