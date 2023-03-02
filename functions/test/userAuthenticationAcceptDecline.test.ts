import { expect } from 'firebase-function/lib/src/testUtils';
import { authenticateTestUser, cleanUpFirebase, firebaseApp } from './firebaseApp';

describe('userAuthenticationAcceptDecline', () => {
    beforeEach(async() => {
        await authenticateTestUser();
    });

    afterEach(async() => {
        await cleanUpFirebase();
    });

    it('accept missing user', async() => {
        const result = await firebaseApp.functions.function('userAuthentication').function('acceptDecline').call({
            type: 'websiteEditing',
            hashedUserId: 'user_id',
            action: 'accept'
        });
        result.success;
    });

    it('accept authenticated user', async() => {
        await firebaseApp.database.child('users').child('authentication').child('websiteEditing').child('user_id').set({
            state: 'authenticated',
            firstName: 'John',
            lastName: 'Doe'
        }, true);
        const result = await firebaseApp.functions.function('userAuthentication').function('acceptDecline').call({
            type: 'websiteEditing',
            hashedUserId: 'user_id',
            action: 'accept'
        });
        result.success;
        expect(await firebaseApp.database.child('users').child('authentication').child('websiteEditing').child('user_id').get(true)).to.be.deep.equal({
            state: 'authenticated',
            firstName: 'John',
            lastName: 'Doe'
        });
    });

    it('accept unauthenticated user', async() => {
        await firebaseApp.database.child('users').child('authentication').child('websiteEditing').child('user_id').set({
            state: 'unauthenticated',
            firstName: 'John',
            lastName: 'Doe'
        }, true);
        const result = await firebaseApp.functions.function('userAuthentication').function('acceptDecline').call({
            type: 'websiteEditing',
            hashedUserId: 'user_id',
            action: 'accept'
        });
        result.success;
        expect(await firebaseApp.database.child('users').child('authentication').child('websiteEditing').child('user_id').get(true)).to.be.deep.equal({
            state: 'authenticated',
            firstName: 'John',
            lastName: 'Doe'
        });
    });

    it('decline missing user', async() => {
        const result = await firebaseApp.functions.function('userAuthentication').function('acceptDecline').call({
            type: 'websiteEditing',
            hashedUserId: 'user_id',
            action: 'decline'
        });
        result.success;
    });

    it('decline authenticated user', async() => {
        await firebaseApp.database.child('users').child('authentication').child('websiteEditing').child('user_id').set({
            state: 'authenticated',
            firstName: 'John',
            lastName: 'Doe'
        }, true);
        const result = await firebaseApp.functions.function('userAuthentication').function('acceptDecline').call({
            type: 'websiteEditing',
            hashedUserId: 'user_id',
            action: 'decline'
        });
        result.success;
        expect(await firebaseApp.database.child('users').child('authentication').child('websiteEditing').child('user_id').get(true)).to.be.deep.equal({
            state: 'authenticated',
            firstName: 'John',
            lastName: 'Doe'
        });
    });

    it('decline unauthenticated user', async() => {
        await firebaseApp.database.child('users').child('authentication').child('websiteEditing').child('user_id').set({
            state: 'unauthenticated',
            firstName: 'John',
            lastName: 'Doe'
        }, true);
        const result = await firebaseApp.functions.function('userAuthentication').function('acceptDecline').call({
            type: 'websiteEditing',
            hashedUserId: 'user_id',
            action: 'decline'
        });
        result.success;
        expect(await firebaseApp.database.child('users').child('authentication').child('websiteEditing').child('user_id').exists()).to.be.equal(false);
    });
});
