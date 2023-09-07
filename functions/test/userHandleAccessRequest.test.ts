import { authenticateTestUser, cleanUpFirebase, firebaseApp } from "./firebaseApp";
import { expect } from "firebase-function/lib/src/testUtils";

describe('userHandleAccessRequest', () => {
    beforeEach(async () => {
        await authenticateTestUser(['admin']);
    });

    afterEach(async () => {
        await cleanUpFirebase();
    });

    it('not existing user', async () => {
        const result = await firebaseApp.functions.function('user').function('handleAccessRequest').call({
            hashedUserId: 'abc',
            handleRequest: 'accept'
        });
        result.failure.equal({
            code: 'not-found',
            message: 'User not found.'
        });
    });

    it('user not unauthenticated', async () => {
        await firebaseApp.database.child('users').child('abc').set({
            firstName: 'John',
            lastName: 'Doe',
            roles: ['admin']
        }, 'encrypt');
        const result = await firebaseApp.functions.function('user').function('handleAccessRequest').call({
            hashedUserId: 'abc',
            handleRequest: 'accept'
        });
        result.failure.equal({
            code: 'unavailable',
            message: 'User is already authenticated.'
        });
    });

    it('accept', async () => {
        await firebaseApp.database.child('users').child('abc').set({
            firstName: 'John',
            lastName: 'Doe',
            roles: 'unauthenticated'
        }, 'encrypt');
        const result = await firebaseApp.functions.function('user').function('handleAccessRequest').call({
            hashedUserId: 'abc',
            handleRequest: 'accept'
        });
        result.success;
        expect(await firebaseApp.database.child('users').child('abc').get('decrypt')).to.be.deep.equal({
            firstName: 'John',
            lastName: 'Doe',
            roles: []
        });
    });

    it('decline', async () => {
        await firebaseApp.database.child('users').child('abc').set({
            firstName: 'John',
            lastName: 'Doe',
            roles: 'unauthenticated'
        }, 'encrypt');
        const result = await firebaseApp.functions.function('user').function('handleAccessRequest').call({
            hashedUserId: 'abc',
            handleRequest: 'decline'
        });
        result.success;
        expect(await firebaseApp.database.child('users').child('abc').exists()).to.be.equal(false);
    });
});