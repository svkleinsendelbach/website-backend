import { Crypter } from 'firebase-function';
import { expect, expectResult, FirebaseApp } from 'firebase-function/lib/src/testUtils';
import { type DeleteAllDataFunction } from '../src/functions/DeleteAllDataFunction';
import { type UserAuthenticationAcceptDeclineFunction } from '../src/functions/UserAuthenticationAcceptDeclineFunction';
import { type UserAuthentication } from '../src/types/UserAuthentication';
import { callSecretKey, cryptionKeys, firebaseConfig, testUser } from './privateKeys';

describe('userAuthenticationAcceptDecline', () => {
    const firebaseApp = new FirebaseApp(firebaseConfig, cryptionKeys, callSecretKey, {
        functionsRegion: 'europe-west1',
        databaseUrl: firebaseConfig.databaseURL
    });

    beforeEach(async() => {
        await firebaseApp.auth.signIn(testUser.email, testUser.password);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await firebaseApp.database.setEncrypted<UserAuthentication>(`users/authentication/websiteEditing/${Crypter.sha512(firebaseApp.auth.currentUser!.uid)}`, {
            state: 'authenticated',
            firstName: testUser.firstName,
            lastName: testUser.lastName
        });
    });

    afterEach(async() => {
        const result = await firebaseApp.functions.call<DeleteAllDataFunction>('deleteAllData', {});
        expectResult(result).success;
        await firebaseApp.auth.signOut();
    });

    it('accept missing user', async() => {
        const result = await firebaseApp.functions.call<UserAuthenticationAcceptDeclineFunction>('userAuthenticationAcceptDecline', {
            type: 'websiteEditing',
            hashedUserId: 'user_id',
            action: 'accept'
        });
        expectResult(result).success;
    });

    it('accept authenticated user', async() => {
        await firebaseApp.database.setEncrypted<UserAuthentication>('users/authentication/websiteEditing/user_id', {
            state: 'authenticated',
            firstName: 'John',
            lastName: 'Doe'
        });
        const result = await firebaseApp.functions.call<UserAuthenticationAcceptDeclineFunction>('userAuthenticationAcceptDecline', {
            type: 'websiteEditing',
            hashedUserId: 'user_id',
            action: 'accept'
        });
        expectResult(result).success;
        expect(await firebaseApp.database.getDecrypted<UserAuthentication>('users/authentication/websiteEditing/user_id')).to.be.deep.equal({
            state: 'authenticated',
            firstName: 'John',
            lastName: 'Doe'
        });
    });

    it('accept unauthenticated user', async() => {
        await firebaseApp.database.setEncrypted<UserAuthentication>('users/authentication/websiteEditing/user_id', {
            state: 'unauthenticated',
            firstName: 'John',
            lastName: 'Doe'
        });
        const result = await firebaseApp.functions.call<UserAuthenticationAcceptDeclineFunction>('userAuthenticationAcceptDecline', {
            type: 'websiteEditing',
            hashedUserId: 'user_id',
            action: 'accept'
        });
        expectResult(result).success;
        expect(await firebaseApp.database.getDecrypted<UserAuthentication>('users/authentication/websiteEditing/user_id')).to.be.deep.equal({
            state: 'authenticated',
            firstName: 'John',
            lastName: 'Doe'
        });
    });

    it('decline missing user', async() => {
        const result = await firebaseApp.functions.call<UserAuthenticationAcceptDeclineFunction>('userAuthenticationAcceptDecline', {
            type: 'websiteEditing',
            hashedUserId: 'user_id',
            action: 'decline'
        });
        expectResult(result).success;
    });

    it('decline authenticated user', async() => {
        await firebaseApp.database.setEncrypted<UserAuthentication>('users/authentication/websiteEditing/user_id', {
            state: 'authenticated',
            firstName: 'John',
            lastName: 'Doe'
        });
        const result = await firebaseApp.functions.call<UserAuthenticationAcceptDeclineFunction>('userAuthenticationAcceptDecline', {
            type: 'websiteEditing',
            hashedUserId: 'user_id',
            action: 'decline'
        });
        expectResult(result).success;
        expect(await firebaseApp.database.getDecrypted<UserAuthentication>('users/authentication/websiteEditing/user_id')).to.be.deep.equal({
            state: 'authenticated',
            firstName: 'John',
            lastName: 'Doe'
        });
    });

    it('decline unauthenticated user', async() => {
        await firebaseApp.database.setEncrypted<UserAuthentication>('users/authentication/websiteEditing/user_id', {
            state: 'unauthenticated',
            firstName: 'John',
            lastName: 'Doe'
        });
        const result = await firebaseApp.functions.call<UserAuthenticationAcceptDeclineFunction>('userAuthenticationAcceptDecline', {
            type: 'websiteEditing',
            hashedUserId: 'user_id',
            action: 'decline'
        });
        expectResult(result).success;
        expect(await firebaseApp.database.exists('users/authentication/websiteEditing/user_id')).to.be.equal(false);
    });
});
