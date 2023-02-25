import { Crypter } from 'firebase-function';
import { expect, expectResult, FirebaseApp } from 'firebase-function/lib/src/testUtils';
import { type DeleteAllDataFunction } from '../src/functions/DeleteAllDataFunction';
import { type UserAuthenticationAddFunction } from '../src/functions/UserAuthenticationAddFunction';
import { type UserAuthentication } from '../src/types/UserAuthentication';
import { cryptionKeys, firebaseConfig, testUser } from './privateKeys';

describe('userAuthenticationAdd', () => {
    const firebaseApp = new FirebaseApp(firebaseConfig, cryptionKeys, {
        functionsRegion: 'europe-west1',
        databaseUrl: firebaseConfig.databaseURL
    });

    beforeEach(async() => {
        await firebaseApp.auth.signIn(testUser.email, testUser.password);
    });

    afterEach(async() => {
        const result = await firebaseApp.functions.call<DeleteAllDataFunction.Parameters.Flatten, DeleteAllDataFunction.ReturnType>('deleteAllData', {
            databaseType: 'testing'
        });
        expectResult(result).success;
        await firebaseApp.auth.signOut();
    });

    it('add user', async() => {
        const result = await firebaseApp.functions.call<UserAuthenticationAddFunction.Parameters.Flatten, UserAuthenticationAddFunction.ReturnType>('userAuthenticationAdd', {
            databaseType: 'testing',
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
