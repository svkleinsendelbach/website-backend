import { Crypter } from 'firebase-function';
import { cleanUpFirebase, firebaseApp } from './firebaseApp';
import { testUser } from './privateKeys';

describe('userAuthenticationCheck', () => {
    beforeEach(async() => {
        await firebaseApp.auth.signIn(testUser.email, testUser.password);
    });

    afterEach(async() => {
        await cleanUpFirebase();
    });

    it('not authenticated', async() => {
        const result = await firebaseApp.functions.function('userAuthentication').function('check').call({
            type: 'websiteEditing'
        });
        result.failure.equal({
            code: 'permission-denied',
            message: 'The function must be called while authenticated, not authenticated for websiteEditing.'
        });
    });

    it('unauthenticated', async() => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await firebaseApp.database.child('users').child('authentication').child('websiteEditing').child(Crypter.sha512(firebaseApp.auth.currentUser!.uid)).set({
            state: 'unauthenticated',
            firstName: 'John',
            lastName: 'Doe'
        }, true);
        const result = await firebaseApp.functions.function('userAuthentication').function('check').call({
            type: 'websiteEditing'
        });
        result.failure.equal({
            code: 'permission-denied',
            message: 'The function must be called while authenticated, unauthenticated for websiteEditing.'
        });
    });

    it('authenticated', async() => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await firebaseApp.database.child('users').child('authentication').child('websiteEditing').child(Crypter.sha512(firebaseApp.auth.currentUser!.uid)).set({
            state: 'authenticated',
            firstName: 'John',
            lastName: 'Doe'
        }, true);
        const result = await firebaseApp.functions.function('userAuthentication').function('check').call({
            type: 'websiteEditing'
        });
        result.success;
    });
});
