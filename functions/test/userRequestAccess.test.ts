import { expect } from "firebase-function/lib/src/testUtils";
import { cleanUpFirebase, firebaseApp } from "./firebaseApp";
import { testUser } from "./privateKeys";
import { sha512 } from "firebase-function";

describe('userHandleAccessRequest', () => {
    beforeEach(async () => {
        await firebaseApp.auth.signIn(testUser.email, testUser.password);
    });

    afterEach(async () => {
        await cleanUpFirebase();
    });

    it('already exist', async () => {
        await firebaseApp.database.child('users').child(sha512(firebaseApp.auth.currentUser!.uid)).set({
            firstName: 'John',
            lastName: 'Doe',
            roles: 'unauthenticated'
        }, 'encrypt');
        const result = await firebaseApp.functions.function('user').function('requestAccess').call({
            firstName: 'VAR',
            lastName: 'öoij'
        });
        result.failure.equal({
            code: 'already-exists',
            message: 'User has already requested access.'
        });
    });

    it('request', async () => {
        const result = await firebaseApp.functions.function('user').function('requestAccess').call({
            firstName: 'VAR',
            lastName: 'öoij'
        });
        result.success;
        expect(await firebaseApp.database.child('users').child(sha512(firebaseApp.auth.currentUser!.uid)).get('decrypt')).to.be.deep.equal({
            firstName: 'VAR',
            lastName: 'öoij',
            roles: 'unauthenticated'
        });
    });
});
