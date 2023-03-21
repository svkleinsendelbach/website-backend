import { Crypter } from 'firebase-function';
import { expect } from 'firebase-function/lib/src/testUtils';
import { cleanUpFirebase, firebaseApp } from './firebaseApp';
import { testUser } from './privateKeys';

describe('userAuthenticationAdd', () => {
    beforeEach(async () => {
        await firebaseApp.auth.signIn(testUser.email, testUser.password);
    });

    afterEach(async () => {
        await cleanUpFirebase();
    });

    it('add user', async () => {
        const result = await firebaseApp.functions.function('userAuthentication').function('add').call({
            authenticationTypes: ['editEvents', 'editReports'],
            firstName: 'John',
            lastName: 'Doe'
        });
        result.success;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(await firebaseApp.database.child('users').child('authentication').child('editEvents').child(Crypter.sha512(firebaseApp.auth.currentUser!.uid)).get('decrypt')).to.be.deep.equal({
            state: 'unauthenticated',
            firstName: 'John',
            lastName: 'Doe'
        });
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(await firebaseApp.database.child('users').child('authentication').child('editReports').child(Crypter.sha512(firebaseApp.auth.currentUser!.uid)).get('decrypt')).to.be.deep.equal({
            state: 'unauthenticated',
            firstName: 'John',
            lastName: 'Doe'
        });
    });
});
