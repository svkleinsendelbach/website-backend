import { expect } from 'chai';
import { Crypter } from '../../src/crypter/Crypter';
import { UserAuthentication } from '../../src/utils/checkPrerequirements';
import { cryptionKeys } from '../privateKeys';
import { signInTestUser, callFunction, expectSuccess, signOutUser, setDatabaseValue, getCurrentUser, getDecryptedDatabaseValue, existsDatabaseValue } from '../utils';

describe('accept decline waiting user', () => {
    beforeEach(async () => {
        await signInTestUser();
        const crypter = new Crypter(cryptionKeys);
        const hashedUserId = Crypter.sha512(getCurrentUser()!.uid);
        await setDatabaseValue(`users/authentication/websiteEditing/${hashedUserId}`, crypter.encodeEncrypt({
            state: 'authenticated',
            firstName: 'test',
            lastName: 'user'
        }));
    });

    afterEach(async () => {
        const result = await callFunction('v2_deleteAllData', {});
        expectSuccess(result).to.be.equal(undefined);
        await signOutUser();
    });
    
    it('Accept authenicated user', async () => {
        const crypter = new Crypter(cryptionKeys);
        await setDatabaseValue('users/authentication/websiteEditing/asdf', crypter.encodeEncrypt({
            state: 'authenticated',
            firstName: 'first',
            lastName: 'last'
        }));
        const result = await callFunction('v2_acceptDeclineWaitingUser', {
            type: 'websiteEditing',
            hashedUserId: 'asdf',
            action: 'accept'
        });
        expectSuccess(result).to.be.equal(undefined);
        const databaseValue = await getDecryptedDatabaseValue<UserAuthentication>('users/authentication/websiteEditing/asdf');
        expect(databaseValue).to.be.deep.equal({
            state: 'authenticated',
            firstName: 'first',
            lastName: 'last'
        });
    });

    it('Accept unautheticated user', async () => {
        const crypter = new Crypter(cryptionKeys);
        await setDatabaseValue('users/authentication/websiteEditing/asdf', crypter.encodeEncrypt({
            state: 'unauthenticated',
            firstName: 'first',
            lastName: 'last'
        }));
        const result = await callFunction('v2_acceptDeclineWaitingUser', {
            type: 'websiteEditing',
            hashedUserId: 'asdf',
            action: 'accept'
        });
        expectSuccess(result).to.be.equal(undefined);
        const databaseValue = await getDecryptedDatabaseValue<UserAuthentication>('users/authentication/websiteEditing/asdf');
        expect(databaseValue).to.be.deep.equal({
            state: 'authenticated',
            firstName: 'first',
            lastName: 'last'
        });
    });
    
    it('Accept missing user', async () => {
        const result = await callFunction('v2_acceptDeclineWaitingUser', {
            type: 'websiteEditing',
            hashedUserId: 'asdf',
            action: 'accept'
        });
        expectSuccess(result).to.be.equal(undefined);
    });
    
    it('Decline authenticated user', async () => {
        const crypter = new Crypter(cryptionKeys);
        await setDatabaseValue('users/authentication/websiteEditing/asdf', crypter.encodeEncrypt({
            state: 'authenticated',
            firstName: 'first',
            lastName: 'last'
        }));
        const result = await callFunction('v2_acceptDeclineWaitingUser', {
            type: 'websiteEditing',
            hashedUserId: 'asdf',
            action: 'decline'
        });
        expectSuccess(result).to.be.equal(undefined);
        const databaseValue = await getDecryptedDatabaseValue<UserAuthentication>('users/authentication/websiteEditing/asdf');
        expect(databaseValue).to.be.deep.equal({
            state: 'authenticated',
            firstName: 'first',
            lastName: 'last'
        });
    });

    it('Decline unauthenticated user', async () => {
        const crypter = new Crypter(cryptionKeys);
        await setDatabaseValue('users/authentication/websiteEditing/asdf', crypter.encodeEncrypt({
            state: 'unauthenticated',
            firstName: 'first',
            lastName: 'last'
        }));
        const result = await callFunction('v2_acceptDeclineWaitingUser', {
            type: 'websiteEditing',
            hashedUserId: 'asdf',
            action: 'decline'
        });
        expectSuccess(result).to.be.equal(undefined);
        const existsValue = await existsDatabaseValue('users/authentication/websiteEditing/asdf');
        expect(existsValue).to.be.false;
    });

    it('Decline missing user', async () => {
        const result = await callFunction('v2_acceptDeclineWaitingUser', {
            type: 'websiteEditing',
            hashedUserId: 'asdf',
            action: 'decline'
        });
        expectSuccess(result).to.be.equal(undefined);
    });
});
