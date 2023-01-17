import { expect } from 'chai';
import { Crypter } from '../../src/crypter/Crypter';
import { UserAuthentication } from '../../src/utils/checkPrerequirements';
import { signInTestUser, getCurrentUser, callFunction, expectSuccess, signOutUser, getDecryptedDatabaseValue } from '../utils';

describe('add user for waiting', () => {
    beforeEach(async () => {
        await signInTestUser();
    });

    afterEach(async () => {
        const result = await callFunction('v2_deleteAllData', {});
        expectSuccess(result).to.be.equal(undefined);
        await signOutUser();
    });

    it('add user', async () => {
        const result = await callFunction('v2_addUserForWaiting', {
            type: 'websiteEditing',
            firstName: 'first',
            lastName: 'last'
        });
        expectSuccess(result).to.be.equal(undefined);
        const databaseValue = await getDecryptedDatabaseValue<UserAuthentication>(`users/authentication/websiteEditing/${Crypter.sha512(getCurrentUser()!.uid)}`);
        expect(databaseValue).to.be.deep.equal({
            state: 'unauthenticated',
            firstName: 'first',
            lastName: 'last'
        });
    });
});
