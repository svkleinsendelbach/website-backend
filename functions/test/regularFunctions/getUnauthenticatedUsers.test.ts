import { sha512 } from 'sha512-crypt-ts';
import { Crypter } from '../../src/crypter/Crypter';
import { GetUnauthenticatedUsersFunction } from '../../src/regularFunctions/GetUnauthenticatedUsersFunction';
import { ArrayElement } from '../../src/utils/utils';
import { cryptionKeys } from '../privateKeys';
import { signInTestUser, getCurrentUser, setDatabaseValue, callFunction, expectSuccess, signOutUser } from '../utils';

describe('get unauthenticated users', () => {
    beforeEach(async () => {
        await signInTestUser();
        const crypter = new Crypter(cryptionKeys);
        const hashedUserId = sha512.base64(getCurrentUser()!.uid);
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

    async function addUser(number: number, state: 'authenticated' | 'unauthenticated'): Promise<ArrayElement<GetUnauthenticatedUsersFunction.ReturnType>> {
        const crypter = new Crypter(cryptionKeys);
        const user = {
            hashedUserId: `user_id_${number}`,
            firstName: `first_${number}`,
            lastName: `last_${number}`
        };
        await setDatabaseValue(`users/authentication/websiteEditing/user_id_${number}`, crypter.encodeEncrypt({
            firstName: user.firstName,
            lastName: user.lastName,
            state: state
        }));
        return user;
    }

    it('empty users', async () => {
        const result = await callFunction('v2_getUnauthenticatedUsers', {
            type: 'websiteEditing'
        });
        expectSuccess(result).to.be.deep.equal([]);
    });

    it('no unauthenticated users', async () => {
        await addUser(1, 'authenticated');
        await addUser(2, 'authenticated');
        await addUser(3, 'authenticated');
        const result = await callFunction('v2_getUnauthenticatedUsers', {
            type: 'websiteEditing'
        });
        expectSuccess(result).to.be.deep.equal([]);
    });

    it('only unauthenticated users', async () => {
        const user1 = await addUser(1, 'unauthenticated');
        const user2 = await addUser(2, 'unauthenticated');
        const user3 = await addUser(3, 'unauthenticated');
        const result = await callFunction('v2_getUnauthenticatedUsers', {
            type: 'websiteEditing'
        });
        expectSuccess(result).to.be.deep.equal([
            user1, user2, user3
        ]);
    });

    it('authenticated and unauthenticated users', async () => {
        const user1 = await addUser(1, 'unauthenticated');
        await addUser(2, 'authenticated');
        const user3 = await addUser(3, 'unauthenticated');
        const user4 = await addUser(4, 'unauthenticated');
        await addUser(5, 'authenticated');
        await addUser(6, 'authenticated');
        const result = await callFunction('v2_getUnauthenticatedUsers', {
            type: 'websiteEditing'
        });
        expectSuccess(result).to.be.deep.equal([
            user1, user3, user4
        ]);
    });
});
