import { Crypter } from 'firebase-function';
import { cleanUpFirebase, firebaseApp } from './firebaseApp';
import { testUser } from './privateKeys';

describe('userAuthenticationCheck', () => {
    beforeEach(async () => {
        await firebaseApp.auth.signIn(testUser.email, testUser.password);
    });

    afterEach(async () => {
        await cleanUpFirebase();
    });

    it('not authenticated', async () => {
        const result = await firebaseApp.functions.function('userAuthentication').function('check').call({
            authenicationTypes: ['editEvents', 'editNews']
        });
        result.failure.equal({
            code: 'permission-denied',
            message: 'The function must be called while authenticated, not authenticated for editEvents.'
        });
    });

    it('unauthenticated', async () => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await firebaseApp.database.child('users').child('authentication').child('editEvents').child(Crypter.sha512(firebaseApp.auth.currentUser!.uid)).set({
            state: 'unauthenticated',
            firstName: 'John',
            lastName: 'Doe'
        }, 'encrypt');
        const result = await firebaseApp.functions.function('userAuthentication').function('check').call({
            authenicationTypes: ['editEvents']
        });
        result.failure.equal({
            code: 'permission-denied',
            message: 'The function must be called while authenticated, unauthenticated for editEvents.'
        });
    });

    it('authenticated', async () => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await firebaseApp.database.child('users').child('authentication').child('editEvents').child(Crypter.sha512(firebaseApp.auth.currentUser!.uid)).set({
            state: 'authenticated',
            firstName: 'John',
            lastName: 'Doe'
        }, 'encrypt');
        const result = await firebaseApp.functions.function('userAuthentication').function('check').call({
            authenicationTypes: ['editEvents']
        });
        result.success;
    });

    it('not authenticated', async () => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await firebaseApp.database.child('users').child('authentication').child('editEvents').child(Crypter.sha512(firebaseApp.auth.currentUser!.uid)).set({
            state: 'unauthenticated',
            firstName: 'John',
            lastName: 'Doe'
        }, 'encrypt');
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await firebaseApp.database.child('users').child('authentication').child('editNews').child(Crypter.sha512(firebaseApp.auth.currentUser!.uid)).set({
            state: 'authenticated',
            firstName: 'John',
            lastName: 'Doe'
        }, 'encrypt');
        const result = await firebaseApp.functions.function('userAuthentication').function('check').call({
            authenicationTypes: ['editEvents', 'editNews', 'authenticateUser']
        });
        try {
            result.failure.equal({
                code: 'permission-denied',
                message: 'The function must be called while authenticated, unauthenticated for editEvents.'
            });
        } catch {
            result.failure.equal({
                code: 'permission-denied',
                message: 'The function must be called while authenticated, not authenticated for authenticateUser.'
            });
        }
    });
});
