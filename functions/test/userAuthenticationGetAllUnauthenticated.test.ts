import { type FunctionType, type ObjectValue } from 'firebase-function';
import { type UserAuthenticationGetAllUnauthenticatedFunctionType } from '../src/functions/UserAuthenticationGetAllUnauthenticatedFunction';
import { authenticateTestUser, cleanUpFirebase, firebaseApp } from './firebaseApp';

describe('userAuthenticationGetAllUnauthenticated', () => {
    beforeEach(async() => {
        await authenticateTestUser();
    });

    afterEach(async() => {
        await cleanUpFirebase();
    });

    async function addUser(number: number, state: 'authenticated' | 'unauthenticated'): Promise<ObjectValue<FunctionType.ReturnType<UserAuthenticationGetAllUnauthenticatedFunctionType>>> {
        const user = {
            hashedUserId: `user_id_${number}`,
            firstName: `first_${number}`,
            lastName: `last_${number}`
        };
        await firebaseApp.database.child('users').child('authentication').child('websiteEditing').child(`user_id_${number}`).set({
            state: state,
            firstName: user.firstName,
            lastName: user.lastName
        }, true);
        return user;
    }

    it('empty users', async() => {
        const result = await firebaseApp.functions.function('userAuthentication').function('getAllUnauthenticated').call({
            type: 'websiteEditing'
        });
        result.success.equal([]);
    });

    it('no unauthenticated users', async() => {
        await addUser(1, 'authenticated');
        await addUser(2, 'authenticated');
        await addUser(3, 'authenticated');
        const result = await firebaseApp.functions.function('userAuthentication').function('getAllUnauthenticated').call({
            type: 'websiteEditing'
        });
        result.success.equal([]);
    });

    it('only unauthenticated users', async() => {
        const user1 = await addUser(1, 'unauthenticated');
        const user2 = await addUser(2, 'unauthenticated');
        const user3 = await addUser(3, 'unauthenticated');
        const result = await firebaseApp.functions.function('userAuthentication').function('getAllUnauthenticated').call({
            type: 'websiteEditing'
        });
        result.success.equal([
            user1, user2, user3
        ]);
    });

    it('authenticated and unauthenticated users', async() => {
        const user1 = await addUser(1, 'unauthenticated');
        await addUser(2, 'authenticated');
        const user3 = await addUser(3, 'unauthenticated');
        const user4 = await addUser(4, 'unauthenticated');
        await addUser(5, 'authenticated');
        await addUser(6, 'authenticated');
        const result = await firebaseApp.functions.function('userAuthentication').function('getAllUnauthenticated').call({
            type: 'websiteEditing'
        });
        result.success.equal([
            user1, user3, user4
        ]);
    });
});
