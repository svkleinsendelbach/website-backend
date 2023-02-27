import { Crypter } from 'firebase-function';
import { expect, expectResult, FirebaseApp } from 'firebase-function/lib/src/testUtils';
import { type DeleteAllDataFunction } from '../src/functions/DeleteAllDataFunction';
import { type UserAuthenticationAddFunction } from '../src/functions/UserAuthenticationAddFunction';
import { type UserAuthentication } from '../src/types/UserAuthentication';
import { callSecretKey, cryptionKeys, firebaseConfig } from './privateKeys';

describe('userAuthenticationAdd', () => {
    const firebaseApp = new FirebaseApp(firebaseConfig, cryptionKeys, callSecretKey, {
        functionsRegion: 'europe-west1',
        databaseUrl: firebaseConfig.databaseURL
    });

    afterEach(async() => {
        const result = await firebaseApp.functions.call<DeleteAllDataFunction.Parameters, DeleteAllDataFunction.ReturnType>('deleteAllData', {});
        expectResult(result).success;
    });

    it('add user', async() => {
        const result = await firebaseApp.functions.call<UserAuthenticationAddFunction.Parameters, UserAuthenticationAddFunction.ReturnType>('userAuthenticationAdd', {
            type: 'websiteEditing',
            firstName: 'John',
            lastName: 'Doe'
        });
        expectResult(result).success;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const databaseValue = await firebaseApp.database.getDecrypted<UserAuthentication>(`users/authentication/websiteEditing/${Crypter.sha512(firebaseApp.auth.currentUser!.uid)}`);
        expect(databaseValue).to.be.deep.equal({
            state: 'unauthenticated',
            firstName: 'John',
            lastName: 'Doe'
        });
    });
});
