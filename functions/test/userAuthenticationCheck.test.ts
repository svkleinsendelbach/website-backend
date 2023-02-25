import { Crypter } from 'firebase-function';
import { expectResult, FirebaseApp } from 'firebase-function/lib/src/testUtils';
import { type DeleteAllDataFunction } from '../src/functions/DeleteAllDataFunction';
import { type UserAuthenticationCheckFunction } from '../src/functions/UserAuthenticationCheckFunction';
import { cryptionKeys, firebaseConfig, testUser } from './privateKeys';

describe('userAuthenticationCheck', () => {
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

    it('not authenticated', async() => {
        const result = await firebaseApp.functions.call<UserAuthenticationCheckFunction.Parameters.Flatten, UserAuthenticationCheckFunction.ReturnType>('userAuthenticationCheck', {
            databaseType: 'testing',
            type: 'websiteEditing'
        });
        expectResult(result).failure.to.be.deep.equal({
            code: 'permission-denied',
            message: 'The function must be called while authenticated, not authenticated for websiteEditing.'
        });
    });

    it('unauthenticated', async() => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await firebaseApp.database.setEncrypted(`users/authentication/websiteEditing/${Crypter.sha512(firebaseApp.auth.currentUser!.uid)}`, {
            state: 'unauthenticated',
            firstName: 'John',
            lastName: 'Doe'
        });
        const result = await firebaseApp.functions.call<UserAuthenticationCheckFunction.Parameters.Flatten, UserAuthenticationCheckFunction.ReturnType>('userAuthenticationCheck', {
            databaseType: 'testing',
            type: 'websiteEditing'
        });
        expectResult(result).failure.to.be.deep.equal({
            code: 'permission-denied',
            message: 'The function must be called while authenticated, unauthenticated for websiteEditing.'
        });
    });

    it('authenticated', async() => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await firebaseApp.database.setEncrypted(`users/authentication/websiteEditing/${Crypter.sha512(firebaseApp.auth.currentUser!.uid)}`, {
            state: 'authenticated',
            firstName: 'John',
            lastName: 'Doe'
        });
        const result = await firebaseApp.functions.call<UserAuthenticationCheckFunction.Parameters.Flatten, UserAuthenticationCheckFunction.ReturnType>('userAuthenticationCheck', {
            databaseType: 'testing',
            type: 'websiteEditing'
        });
        expectResult(result).success;
    });
});
