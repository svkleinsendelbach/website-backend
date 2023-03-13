import { type FunctionType, type ObjectValue } from 'firebase-function';
import { type UserAuthenticationGetAllUnauthenticatedFunctionType } from '../src/functions/UserAuthenticationGetAllUnauthenticatedFunction';
import { type UserAuthenticationType } from '../src/types/UserAuthentication';
import { authenticateTestUser, cleanUpFirebase, firebaseApp } from './firebaseApp';

describe('userAuthenticationGetAllUnauthenticated', () => {
    beforeEach(async () => {
        await authenticateTestUser();
    });

    afterEach(async () => {
        await cleanUpFirebase();
    });

    async function addUser(number: number, authenticationType: UserAuthenticationType, state: 'authenticated' | 'unauthenticated'): Promise<ObjectValue<FunctionType.ReturnType<UserAuthenticationGetAllUnauthenticatedFunctionType>>> {
        const user = {
            hashedUserId: `user_id_${number}`,
            firstName: `first_${number}`,
            lastName: `last_${number}`
        };
        await firebaseApp.database.child('users').child('authentication').child(authenticationType).child(`user_id_${number}`).set({
            state: state,
            firstName: user.firstName,
            lastName: user.lastName
        }, true);
        return user;
    }

    it('empty users', async () => {
        const result = await firebaseApp.functions.function('userAuthentication').function('getAllUnauthenticated').call({
            authenticationTypes: ['editEvents']
        });
        result.success.equal([]);
    });

    it('no unauthenticated users', async () => {
        await addUser(1, 'editEvents', 'authenticated');
        await addUser(2, 'editNews', 'authenticated');
        await addUser(3, 'editEvents', 'authenticated');
        const result = await firebaseApp.functions.function('userAuthentication').function('getAllUnauthenticated').call({
            authenticationTypes: ['editEvents', 'editNews']
        });
        result.success.equal([]);
    });

    it('only unauthenticated users', async () => {
        const user1 = await addUser(1, 'editEvents', 'unauthenticated');
        const user2 = await addUser(2, 'editNews', 'unauthenticated');
        const user3 = await addUser(3, 'editEvents', 'unauthenticated');
        const result = await firebaseApp.functions.function('userAuthentication').function('getAllUnauthenticated').call({
            authenticationTypes: ['editEvents', 'editNews']
        });
        result.success.unsorted([
            user1, user2, user3
        ]);
    });

    it('authenticated and unauthenticated users', async () => {
        const user1 = await addUser(1, 'editEvents', 'unauthenticated');
        await addUser(2, 'editNews', 'authenticated');
        const user3 = await addUser(3, 'editEvents', 'unauthenticated');
        const user4 = await addUser(4, 'editNews', 'unauthenticated');
        await addUser(5, 'editEvents', 'authenticated');
        await addUser(6, 'editNews', 'authenticated');
        const result = await firebaseApp.functions.function('userAuthentication').function('getAllUnauthenticated').call({
            authenticationTypes: ['editEvents', 'editNews']
        });
        result.success.unsorted([
            user1, user3, user4
        ]);
    });
});
