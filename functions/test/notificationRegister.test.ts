import { Crypter } from 'firebase-function';
import { expect } from 'firebase-function/lib/src/testUtils';
import { cleanUpFirebase, firebaseApp } from './firebaseApp';

describe('notificationRegister', () => {
    afterEach(async () => {
        await cleanUpFirebase();
    });

    it('register not existing', async () => {
        const result = await firebaseApp.functions.function('notification').function('register').call({
            notificationType: 'general',
            token: 'abcd'
        });
        result.success;
        expect(await firebaseApp.database.child('notification').child('general').child(Crypter.sha512('abcd')).get()).to.be.equal('abcd');
    });

    it('register existing', async () => {
        await firebaseApp.database.child('notification').child('general').child(Crypter.sha512('xyz')).set('xyz');
        const result = await firebaseApp.functions.function('notification').function('register').call({
            notificationType: 'general',
            token: 'xyz'
        });
        result.failure.equal({
            code: 'already-exists',
            message: 'Couldn\'t register token multiple times.'
        });
    });
});
