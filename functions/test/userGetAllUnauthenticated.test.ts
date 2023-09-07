import { authenticateTestUser, cleanUpFirebase, firebaseApp } from "./firebaseApp";

describe('userGetAllUnauthenticated', () => {
    beforeEach(async () => {
        await authenticateTestUser(['admin']);
    });

    afterEach(async () => {
        await cleanUpFirebase();
    });

    it('get unauthenticated users', async () => {
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
        const result = await firebaseApp.functions.function('user').function('getAlUnauthenticated').call({});
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
});
