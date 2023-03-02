import { Crypter } from 'firebase-function';
import { expect } from 'firebase-function/lib/src/testUtils';
import { cleanUpFirebase, firebaseApp } from './firebaseApp';
import { testUser } from './privateKeys';

describe('userAuthenticationAdd', () => {
    beforeEach(async() => {
        await firebaseApp.auth.signIn(testUser.email, testUser.password);
    });

    afterEach(async() => {
        await cleanUpFirebase();
    });

    it('add user', async() => {
        const result = await firebaseApp.functions.function('userAuthentication').function('add').call({
            type: 'websiteEditing',
            firstName: 'John',
            lastName: 'Doe'
        });
        result.success;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const databaseValue = await firebaseApp.database.child('users').child('authentication').child('websiteEditing').child(Crypter.sha512(firebaseApp.auth.currentUser!.uid)).get(true);
        expect(databaseValue).to.be.deep.equal({
            state: 'unauthenticated',
            firstName: 'John',
            lastName: 'Doe'
        });
    });
});
