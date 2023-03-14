import { Crypter } from 'firebase-function';
import { expect } from 'firebase-function/lib/src/testUtils';
import { authenticateTestUser, cleanUpFirebase, firebaseApp } from './firebaseApp';

describe('notificationPush', () => {
    beforeEach(async () => {
        await authenticateTestUser();
    });

    afterEach(async () => {
        await cleanUpFirebase();
    });

    it('push empty tokens', async () => {
        const result = await firebaseApp.functions.function('notification').function('push').call({
            notificationType: 'general',
            payload: {
                title: 'title',
                body: 'body'
            }
        });
        result.success;
    });

    it('push invalid token', async () => {
        await firebaseApp.database.child('notification').child('general').child(Crypter.sha512('xyz')).set('xyz');
        const result = await firebaseApp.functions.function('notification').function('push').call({
            notificationType: 'general',
            payload: {
                title: 'title',
                body: 'body'
            }
        });
        result.success;
        expect(await firebaseApp.database.child('notification').child('general').child(Crypter.sha512('xyz')).exists()).to.be.equal(false);
    });
});
