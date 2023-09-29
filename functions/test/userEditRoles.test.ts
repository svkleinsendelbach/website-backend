import { sha512 } from "firebase-function";
import { authenticateTestUser, cleanUpFirebase, firebaseApp } from "./firebaseApp";
import { expect } from "firebase-function/lib/src/testUtils";

describe('userCheckRoles', () => {
    beforeEach(async () => {
        await authenticateTestUser(['admin']);
    });

    afterEach(async () => {
        await cleanUpFirebase();
    });

    it('remove admin from myself', async () => {
        const result = await firebaseApp.functions.function('user').function('editRoles').call({
            hashedUserId: sha512(firebaseApp.auth.currentUser!.uid),
            roles: ['websiteManager']
        });
        result.failure.equal({
            code: 'unavailable',
            message: 'Couldn\'t remove admin role from yourself.'
        });
    });

    it('not existing user', async () => {
        const result = await firebaseApp.functions.function('user').function('editRoles').call({
            hashedUserId: 'abc',
            roles: ['admin', 'websiteManager']
        });
        result.failure.equal({
            code: 'not-found',
            message: 'User not found.'
        });
    });

    it('user unauthenticated', async () => {
        await firebaseApp.database.child('users').child('abc').set({
            firstName: 'John',
            lastName: 'Doe',
            roles: 'unauthenticated'
        }, 'encrypt');
        const result = await firebaseApp.functions.function('user').function('editRoles').call({
            hashedUserId: 'abc',
            roles: ['admin', 'websiteManager']
        });
        result.failure.equal({
            code: 'unauthenticated',
            message: 'User is not authenticated.'
        });
    });

    it('change roles', async () => {
        await firebaseApp.database.child('users').child('abc').set({
            firstName: 'John',
            lastName: 'Doe',
            roles: ['admin']
        }, 'encrypt');
        const result = await firebaseApp.functions.function('user').function('editRoles').call({
            hashedUserId: 'abc',
            roles: ['websiteManager']
        });
        result.success;
        expect(await firebaseApp.database.child('users').child('abc').get('decrypt')).to.be.deep.equal({
            firstName: 'John',
            lastName: 'Doe',
            roles: ['websiteManager']
        });
    });
});