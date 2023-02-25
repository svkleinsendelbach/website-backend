import { FirebaseApp, expectResult, expect } from 'firebase-function/lib/src/testUtils';
import { cryptionKeys, firebaseConfig } from './privateKeys';
import { type DeleteAllDataFunction } from '../src/functions/DeleteAllDataFunction';

describe('deleteAllData', () => {
    const firebaseApp = new FirebaseApp(firebaseConfig, cryptionKeys, {
        functionsRegion: 'europe-west1',
        databaseUrl: firebaseConfig.databaseURL
    });

    it('invalid database type', async() => {
        const result = await firebaseApp.functions.call<DeleteAllDataFunction.Parameters.Flatten, DeleteAllDataFunction.ReturnType>('deleteAllData', {
            databaseType: 'debug'
        });
        expectResult(result).failure.to.be.deep.equal({
            code: 'failed-precondition',
            message: 'Function can only be called for testing.'
        });
    });

    it('no data in database', async() => {
        const result = await firebaseApp.functions.call<DeleteAllDataFunction.Parameters.Flatten, DeleteAllDataFunction.ReturnType>('deleteAllData', {
            databaseType: 'testing'
        });
        expectResult(result).success;
        const databaseValue = await firebaseApp.database.getOptional('');
        expect(databaseValue).to.be.equal(null);
    });

    it('data in database', async() => {
        await firebaseApp.database.set('v1/v2', 1234);
        const result = await firebaseApp.functions.call<DeleteAllDataFunction.Parameters.Flatten, DeleteAllDataFunction.ReturnType>('deleteAllData', {
            databaseType: 'testing'
        });
        expectResult(result).success;
        const databaseValue = await firebaseApp.database.getOptional('');
        expect(databaseValue).to.be.equal(null);
    });
});
