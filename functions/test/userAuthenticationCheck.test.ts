import { Crypter } from 'firebase-function';
import { expectResult, FirebaseApp } from 'firebase-function/lib/src/testUtils';
import { type DeleteAllDataFunction } from '../src/functions/DeleteAllDataFunction';
import { type UserAuthenticationCheckFunction } from '../src/functions/UserAuthenticationCheckFunction';
import { type UserAuthentication } from '../src/types/UserAuthentication';
import { callSecretKey, cryptionKeys, firebaseConfig } from './privateKeys';

describe('userAuthenticationCheck', () => {
    const firebaseApp = new FirebaseApp(firebaseConfig, cryptionKeys, callSecretKey, {
        functionsRegion: 'europe-west1',
        databaseUrl: firebaseConfig.databaseURL
    });

    afterEach(async() => {
        const result = await firebaseApp.functions.call<DeleteAllDataFunction.Parameters, DeleteAllDataFunction.ReturnType>('deleteAllData', {});
        expectResult(result).success;
    });

    it('not authenticated', async() => {
        const result = await firebaseApp.functions.call<UserAuthenticationCheckFunction.Parameters, UserAuthenticationCheckFunction.ReturnType>('userAuthenticationCheck', {
            type: 'websiteEditing'
        });
        expectResult(result).failure.to.be.deep.equal({
            code: 'permission-denied',
            message: 'The function must be called while authenticated, not authenticated for websiteEditing.'
        });
    });

    it('unauthenticated', async() => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await firebaseApp.database.setEncrypted<UserAuthentication>(`users/authentication/websiteEditing/${Crypter.sha512(firebaseApp.auth.currentUser!.uid)}`, {
            state: 'unauthenticated',
            firstName: 'John',
            lastName: 'Doe'
        });
        const result = await firebaseApp.functions.call<UserAuthenticationCheckFunction.Parameters, UserAuthenticationCheckFunction.ReturnType>('userAuthenticationCheck', {
            type: 'websiteEditing'
        });
        expectResult(result).failure.to.be.deep.equal({
            code: 'permission-denied',
            message: 'The function must be called while authenticated, unauthenticated for websiteEditing.'
        });
    });

    it('authenticated', async() => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await firebaseApp.database.setEncrypted<UserAuthentication>(`users/authentication/websiteEditing/${Crypter.sha512(firebaseApp.auth.currentUser!.uid)}`, {
            state: 'authenticated',
            firstName: 'John',
            lastName: 'Doe'
        });
        const result = await firebaseApp.functions.call<UserAuthenticationCheckFunction.Parameters, UserAuthenticationCheckFunction.ReturnType>('userAuthenticationCheck', {
            type: 'websiteEditing'
        });
        expectResult(result).success;
    });
});
