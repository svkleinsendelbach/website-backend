import { expect } from 'firebase-function/lib/src/testUtils';
import { authenticateTestUser, cleanUpFirebase, firebaseApp } from './firebaseApp';

describe('userAuthenticationAcceptDecline', () => {
    beforeEach(async () => {
        await authenticateTestUser();
    });

    afterEach(async () => {
        await cleanUpFirebase();
    });

    it('accept missing user', async () => {
        const result = await firebaseApp.functions.function('userAuthentication').function('acceptDecline').call({
            authenticationTypes: ['editEvents', 'editNews'],
            hashedUserId: 'user_id',
            action: 'accept'
        });
        result.success;
    });

    it('accept authenticated user', async () => {
        await firebaseApp.database.child('users').child('authentication').child('editEvents').child('user_id').set({
            state: 'authenticated',
            firstName: 'John',
            lastName: 'Doe'
        }, 'encrypt');
        await firebaseApp.database.child('users').child('authentication').child('editNews').child('user_id').set({
            state: 'authenticated',
            firstName: 'John',
            lastName: 'Doe'
        }, 'encrypt');
        const result = await firebaseApp.functions.function('userAuthentication').function('acceptDecline').call({
            authenticationTypes: ['editEvents', 'editNews'],
            hashedUserId: 'user_id',
            action: 'accept'
        });
        result.success;
        expect(await firebaseApp.database.child('users').child('authentication').child('editEvents').child('user_id').get('decrypt')).to.be.deep.equal({
            state: 'authenticated',
            firstName: 'John',
            lastName: 'Doe'
        });
        expect(await firebaseApp.database.child('users').child('authentication').child('editNews').child('user_id').get('decrypt')).to.be.deep.equal({
            state: 'authenticated',
            firstName: 'John',
            lastName: 'Doe'
        });
    });

    it('accept unauthenticated user', async () => {
        await firebaseApp.database.child('users').child('authentication').child('editEvents').child('user_id').set({
            state: 'unauthenticated',
            firstName: 'John',
            lastName: 'Doe'
        }, 'encrypt');
        await firebaseApp.database.child('users').child('authentication').child('editNews').child('user_id').set({
            state: 'unauthenticated',
            firstName: 'John',
            lastName: 'Doe'
        }, 'encrypt');
        const result = await firebaseApp.functions.function('userAuthentication').function('acceptDecline').call({
            authenticationTypes: ['editEvents', 'editNews'],
            hashedUserId: 'user_id',
            action: 'accept'
        });
        result.success;
        expect(await firebaseApp.database.child('users').child('authentication').child('editEvents').child('user_id').get('decrypt')).to.be.deep.equal({
            state: 'authenticated',
            firstName: 'John',
            lastName: 'Doe'
        });
        expect(await firebaseApp.database.child('users').child('authentication').child('editNews').child('user_id').get('decrypt')).to.be.deep.equal({
            state: 'authenticated',
            firstName: 'John',
            lastName: 'Doe'
        });
    });

    it('accept missing / authenticated / unauthenticated user', async () => {
        await firebaseApp.database.child('users').child('authentication').child('editEvents').child('user_id').set({
            state: 'authenticated',
            firstName: 'John',
            lastName: 'Doe'
        }, 'encrypt');
        await firebaseApp.database.child('users').child('authentication').child('editNews').child('user_id').set({
            state: 'unauthenticated',
            firstName: 'John',
            lastName: 'Doe'
        }, 'encrypt');
        const result = await firebaseApp.functions.function('userAuthentication').function('acceptDecline').call({
            authenticationTypes: ['editEvents', 'editNews', 'authenticateUser'],
            hashedUserId: 'user_id',
            action: 'accept'
        });
        result.success;
        expect(await firebaseApp.database.child('users').child('authentication').child('editEvents').child('user_id').get('decrypt')).to.be.deep.equal({
            state: 'authenticated',
            firstName: 'John',
            lastName: 'Doe'
        });
        expect(await firebaseApp.database.child('users').child('authentication').child('editNews').child('user_id').get('decrypt')).to.be.deep.equal({
            state: 'authenticated',
            firstName: 'John',
            lastName: 'Doe'
        });
    });

    it('decline missing user', async () => {
        const result = await firebaseApp.functions.function('userAuthentication').function('acceptDecline').call({
            authenticationTypes: ['editEvents', 'editNews'],
            hashedUserId: 'user_id',
            action: 'decline'
        });
        result.success;
    });

    it('decline authenticated user', async () => {
        await firebaseApp.database.child('users').child('authentication').child('editEvents').child('user_id').set({
            state: 'authenticated',
            firstName: 'John',
            lastName: 'Doe'
        }, 'encrypt');
        await firebaseApp.database.child('users').child('authentication').child('editNews').child('user_id').set({
            state: 'authenticated',
            firstName: 'John',
            lastName: 'Doe'
        }, 'encrypt');
        const result = await firebaseApp.functions.function('userAuthentication').function('acceptDecline').call({
            authenticationTypes: ['editEvents', 'editNews'],
            hashedUserId: 'user_id',
            action: 'decline'
        });
        result.success;
        expect(await firebaseApp.database.child('users').child('authentication').child('editEvents').child('user_id').get('decrypt')).to.be.deep.equal({
            state: 'authenticated',
            firstName: 'John',
            lastName: 'Doe'
        });
        expect(await firebaseApp.database.child('users').child('authentication').child('editNews').child('user_id').get('decrypt')).to.be.deep.equal({
            state: 'authenticated',
            firstName: 'John',
            lastName: 'Doe'
        });
    });

    it('decline unauthenticated user', async () => {
        await firebaseApp.database.child('users').child('authentication').child('editEvents').child('user_id').set({
            state: 'unauthenticated',
            firstName: 'John',
            lastName: 'Doe'
        }, 'encrypt');
        await firebaseApp.database.child('users').child('authentication').child('editNews').child('user_id').set({
            state: 'unauthenticated',
            firstName: 'John',
            lastName: 'Doe'
        }, 'encrypt');
        const result = await firebaseApp.functions.function('userAuthentication').function('acceptDecline').call({
            authenticationTypes: ['editEvents', 'editNews'],
            hashedUserId: 'user_id',
            action: 'decline'
        });
        result.success;
        expect(await firebaseApp.database.child('users').child('authentication').child('editEvents').child('user_id').exists()).to.be.equal(false);
        expect(await firebaseApp.database.child('users').child('authentication').child('editNews').child('user_id').exists()).to.be.equal(false);
    });

    it('decline missing / authenticated / unauthenticated user', async () => {
        await firebaseApp.database.child('users').child('authentication').child('editEvents').child('user_id').set({
            state: 'authenticated',
            firstName: 'John',
            lastName: 'Doe'
        }, 'encrypt');
        await firebaseApp.database.child('users').child('authentication').child('editNews').child('user_id').set({
            state: 'unauthenticated',
            firstName: 'John',
            lastName: 'Doe'
        }, 'encrypt');
        const result = await firebaseApp.functions.function('userAuthentication').function('acceptDecline').call({
            authenticationTypes: ['editEvents', 'editNews', 'authenticateUser'],
            hashedUserId: 'user_id',
            action: 'decline'
        });
        result.success;
        expect(await firebaseApp.database.child('users').child('authentication').child('editEvents').child('user_id').get('decrypt')).to.be.deep.equal({
            state: 'authenticated',
            firstName: 'John',
            lastName: 'Doe'
        });
        expect(await firebaseApp.database.child('users').child('authentication').child('editNews').child('user_id').exists()).to.be.equal(false);
    });
});
