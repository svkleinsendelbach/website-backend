import { Crypter, type FirebaseFunction, type ObjectValue } from 'firebase-function';
import { expectResult, FirebaseApp } from 'firebase-function/lib/src/testUtils';
import { type DeleteAllDataFunction } from '../src/functions/DeleteAllDataFunction';
import { type UserAuthenticationGetAllUnauthenticatedFunction } from '../src/functions/UserAuthenticationGetAllUnauthenticatedFunction';
import { type UserAuthentication } from '../src/types/UserAuthentication';
import { callSecretKey, cryptionKeys, firebaseConfig, testUser } from './privateKeys';

describe('userAuthenticationGetAllUnauthenticated', () => {
    const firebaseApp = new FirebaseApp(firebaseConfig, cryptionKeys, callSecretKey, {
        functionsRegion: 'europe-west1',
        databaseUrl: firebaseConfig.databaseURL
    });

    beforeEach(async() => {
        await firebaseApp.auth.signIn(testUser.email, testUser.password);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await firebaseApp.database.setEncrypted<UserAuthentication>(`users/authentication/websiteEditing/${Crypter.sha512(firebaseApp.auth.currentUser!.uid)}`, {
            state: 'authenticated',
            firstName: testUser.firstName,
            lastName: testUser.lastName
        });
    });

    afterEach(async() => {
        const result = await firebaseApp.functions.call<DeleteAllDataFunction>('deleteAllData', {});
        expectResult(result).success;
        await firebaseApp.auth.signOut();
    });

    async function addUser(number: number, state: 'authenticated' | 'unauthenticated'): Promise<ObjectValue<FirebaseFunction.ReturnType<UserAuthenticationGetAllUnauthenticatedFunction>>> {
        const user = {
            hashedUserId: `user_id_${number}`,
            firstName: `first_${number}`,
            lastName: `last_${number}`
        };
        await firebaseApp.database.setEncrypted(`users/authentication/websiteEditing/user_id_${number}`, {
            state: state,
            firstName: user.firstName,
            lastName: user.lastName
        });
        return user;
    }

    it('empty users', async() => {
        const result = await firebaseApp.functions.call<UserAuthenticationGetAllUnauthenticatedFunction>('userAuthenticationGetAllUnauthenticated', {
            type: 'websiteEditing'
        });
        expectResult(result).success.to.be.deep.equal([]);
    });

    it('no unauthenticated users', async() => {
        await addUser(1, 'authenticated');
        await addUser(2, 'authenticated');
        await addUser(3, 'authenticated');
        const result = await firebaseApp.functions.call<UserAuthenticationGetAllUnauthenticatedFunction>('userAuthenticationGetAllUnauthenticated', {
            type: 'websiteEditing'
        });
        expectResult(result).success.to.be.deep.equal([]);
    });

    it('only unauthenticated users', async() => {
        const user1 = await addUser(1, 'unauthenticated');
        const user2 = await addUser(2, 'unauthenticated');
        const user3 = await addUser(3, 'unauthenticated');
        const result = await firebaseApp.functions.call<UserAuthenticationGetAllUnauthenticatedFunction>('userAuthenticationGetAllUnauthenticated', {
            type: 'websiteEditing'
        });
        expectResult(result).success.to.be.deep.equal([
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
        const result = await firebaseApp.functions.call<UserAuthenticationGetAllUnauthenticatedFunction>('userAuthenticationGetAllUnauthenticated', {
            type: 'websiteEditing'
        });
        expectResult(result).success.to.be.deep.equal([
            user1, user3, user4
        ]);
    });
});
