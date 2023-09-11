import { Crypter } from "firebase-function";
import { authenticateTestUser, cleanUpFirebase, firebaseApp } from "./firebaseApp";
import { testUser } from "./privateKeys";

describe('userGetAllUnauthenticated', () => {
    beforeEach(async () => {
        await authenticateTestUser(['admin']);
    });

    afterEach(async () => {
        await cleanUpFirebase();
    });

    async function createUsers() {
        await firebaseApp.database.child('users').child('abc').set({
            firstName: 'John',
            lastName: 'Dovere',
            roles: []
        }, 'encrypt');
        await firebaseApp.database.child('users').child('ac').set({
            firstName: 'vtkmtz',
            lastName: 'Doe',
            roles: 'unauthenticated'
        }, 'encrypt');
        await firebaseApp.database.child('users').child('mutz').set({
            firstName: 'John',
            lastName: 'Doe',
            roles: 'unauthenticated'
        }, 'encrypt');
        await firebaseApp.database.child('users').child('ijd').set({
            firstName: 'btw',
            lastName: 'asvra',
            roles: ['admin', 'websiteManager']
        }, 'encrypt');
    }

    it('get all users', async () => {
        await createUsers();
        const result = await firebaseApp.functions.function('user').function('getAll').call({
            type: null
        });
        result.success.unsorted([
            {
                firstName: testUser.firstName,
                lastName: testUser.lastName,
                hashedUserId: Crypter.sha512(firebaseApp.auth.currentUser!.uid),
                roles: ['admin']

            },
            {
                firstName: 'John',
                lastName: 'Dovere',
                hashedUserId: 'abc',
                roles: []
            },
            {
                firstName: 'vtkmtz',
                lastName: 'Doe',
                hashedUserId: 'ac',
                roles: 'unauthenticated'
            },
            {
                firstName: 'John',
                lastName: 'Doe',
                hashedUserId: 'mutz',
                roles: 'unauthenticated'
            },
            {
                firstName: 'btw',
                lastName: 'asvra',
                hashedUserId: 'ijd',
                roles: ['admin', 'websiteManager']
            }
        ]);
    });

    it('get unauthenticated users', async () => {
        await createUsers();
        const result = await firebaseApp.functions.function('user').function('getAll').call({
            type: 'unauthenticated'
        });
        result.success.unsorted([
            {
                firstName: 'vtkmtz',
                lastName: 'Doe',
                hashedUserId: 'ac',
                roles: 'unauthenticated'
            },
            {
                firstName: 'John',
                lastName: 'Doe',
                hashedUserId: 'mutz',
                roles: 'unauthenticated'
            }
        ]);
    });

    it('get authenticated users', async () => {
        await createUsers();
        const result = await firebaseApp.functions.function('user').function('getAll').call({
            type: 'authenticated'
        });
        result.success.unsorted([
            {
                firstName: testUser.firstName,
                lastName: testUser.lastName,
                hashedUserId: Crypter.sha512(firebaseApp.auth.currentUser!.uid),
                roles: ['admin']

            },
            {
                firstName: 'John',
                lastName: 'Dovere',
                hashedUserId: 'abc',
                roles: []
            },
            {
                firstName: 'btw',
                lastName: 'asvra',
                hashedUserId: 'ijd',
                roles: ['admin', 'websiteManager']
            }
        ]);
    });
});
