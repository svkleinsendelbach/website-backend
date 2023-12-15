import { expect } from 'firebase-function/lib/src/testUtils';
import { firebaseApp } from './firebaseApp';

describe('deleteAllData', () => {
    it('no data in database', async () => {
        const result = await firebaseApp.functions.function('deleteAllData').call({});
        result.success;
        expect(await firebaseApp.database.exists()).to.be.equal(false);
    });

    it('data in database', async () => {
        await firebaseApp.database.child('users').child('asdf').set({ firstName: '', lastName: '', roles: [] }, 'encrypt');
        expect(await firebaseApp.database.exists()).to.be.equal(true);
        const result = await firebaseApp.functions.function('deleteAllData').call({});
        result.success;
        expect(await firebaseApp.database.exists()).to.be.equal(false);
    });
});
