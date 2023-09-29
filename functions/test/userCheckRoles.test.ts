import { sha512 } from 'firebase-function';
import { cleanUpFirebase, firebaseApp } from './firebaseApp';
import { testUser } from './privateKeys';

describe('userCheckRoles', () => {
    beforeEach(async () => {
        await firebaseApp.auth.signIn(testUser.email, testUser.password);
    });

    afterEach(async () => {
        await cleanUpFirebase();
    });

    it('not authenticated', async () => {
        const result = await firebaseApp.functions.function('user').function('checkRoles').call({
            roles: ['admin', 'websiteManager']
        });
        result.failure.equal({
            code: 'permission-denied',
            message: 'The function must be called while authenticated, user doesn\'t exist.'
        });
    });

    it('unauthenticated', async () => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await firebaseApp.database.child('users').child(sha512(firebaseApp.auth.currentUser!.uid)).set({
            firstName: 'John',
            lastName: 'Doe',
            roles: 'unauthenticated'
        }, 'encrypt');
        const result = await firebaseApp.functions.function('user').function('checkRoles').call({
            roles: ['admin', 'websiteManager']
        });
        result.failure.equal({
            code: 'permission-denied',
            message: 'The function must be called while authenticated, user is unauthenticated.'
        });
    });

    it('authenticated', async () => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await firebaseApp.database.child('users').child(sha512(firebaseApp.auth.currentUser!.uid)).set({
            firstName: 'John',
            lastName: 'Doe',
            roles: ['admin']
        }, 'encrypt');
        const result = await firebaseApp.functions.function('user').function('checkRoles').call({
            roles: ['admin']
        });
        result.success;
    });

    it('missing role', async () => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await firebaseApp.database.child('users').child(sha512(firebaseApp.auth.currentUser!.uid)).set({
            firstName: 'John',
            lastName: 'Doe',
            roles: ['admin']
        }, 'encrypt');
        const result = await firebaseApp.functions.function('user').function('checkRoles').call({
            roles: ['admin', 'websiteManager']
        });
        result.failure.equal({
            code: 'permission-denied',
            message: 'The function must be called while authenticated, missing roles: websiteManager.'
        });
    });
});
