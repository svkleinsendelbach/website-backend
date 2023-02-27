import { FirebaseApp, expectResult, expect } from 'firebase-function/lib/src/testUtils';
import { callSecretKey, cryptionKeys, firebaseConfig } from './privateKeys';
import { type DeleteAllDataFunction } from '../src/functions/DeleteAllDataFunction';

describe('deleteAllData', () => {
    const firebaseApp = new FirebaseApp(firebaseConfig, cryptionKeys, callSecretKey, {
        functionsRegion: 'europe-west1',
        databaseUrl: firebaseConfig.databaseURL
    });

    it('no data in database', async() => {
        const result = await firebaseApp.functions.call<DeleteAllDataFunction>('deleteAllData', {});
        expectResult(result).success;
        const databaseValue = await firebaseApp.database.getOptional('');
        expect(databaseValue).to.be.equal(null);
    });

    it('data in database', async() => {
        await firebaseApp.database.set<number>('v1/v2', 1234);
        const result = await firebaseApp.functions.call<DeleteAllDataFunction>('deleteAllData', {});
        expectResult(result).success;
        const databaseValue = await firebaseApp.database.getOptional('');
        expect(databaseValue).to.be.equal(null);
    });
});
