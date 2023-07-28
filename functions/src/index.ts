import * as admin from 'firebase-admin';
import { FirebaseSchedule, createFirebaseFunctions } from 'firebase-function';
import { firebaseFunctions } from './firebaseFunctions';
import { getPrivateKeys } from './privateKeys';
import { DailyCleanupFunction } from './functions/DailyCleanupFunction';

admin.initializeApp();

export = {
    ...createFirebaseFunctions(getPrivateKeys, {}, firebaseFunctions),
    dailyCleanup: FirebaseSchedule.create('0 0 * * *', () => new DailyCleanupFunction())
};
