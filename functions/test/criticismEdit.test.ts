import { expect } from 'firebase-function/lib/src/testUtils';
import { authenticateTestUser, cleanUpFirebase, firebaseApp } from './firebaseApp';
import { Guid } from 'firebase-function';

describe('criticismEdit', () => {
    beforeEach(async () => {
        await authenticateTestUser();
    });

    afterEach(async () => {
        await cleanUpFirebase();
    });

    it('remove criticism not existing', async () => {
        const criticismId = Guid.newGuid();
        const result = await firebaseApp.functions.function('criticism').function('edit').call({
            editType: 'remove',
            criticismId: criticismId.guidString,
            criticism: null
        });
        result.success;
    });

    it('remove criticism existing', async () => {
        const criticismId = Guid.newGuid();
        await firebaseApp.database.child('criticisms').child(criticismId.guidString).set({
            type: 'criticism',
            title: 'title',
            description: 'description',
            workedOff: false
        }, 'encrypt');
        const result = await firebaseApp.functions.function('criticism').function('edit').call({
            editType: 'remove',
            criticismId: criticismId.guidString,
            criticism: null
        });
        result.success;
        expect(await firebaseApp.database.child('criticisms').child(criticismId.guidString).exists()).to.be.equal(false);
    });

    it('add criticism not given over', async () => {
        const result = await firebaseApp.functions.function('criticism').function('edit').call({
            editType: 'add',
            criticismId: Guid.newGuid().guidString,
            criticism: null
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'No criticism suggestion in parameters to add / change.'
        });
    });

    it('add criticism not existing', async () => {
        const criticismId = Guid.newGuid();
        const result = await firebaseApp.functions.function('criticism').function('edit').call({
            editType: 'add',
            criticismId: criticismId.guidString,
            criticism: {
                type: 'criticism',
                title: 'title',
                description: 'description',
                workedOff: false
            }
        });
        result.success;
        expect(await firebaseApp.database.child('criticisms').child(criticismId.guidString).get('decrypt')).to.be.deep.equal({
            type: 'criticism',
            title: 'title',
            description: 'description',
            workedOff: false
        });
    });

    it('add criticism existing', async () => {
        const criticismId = Guid.newGuid();
        await firebaseApp.database.child('criticisms').child(criticismId.guidString).set({
            type: 'criticism',
            title: 'title',
            description: 'description',
            workedOff: false
        }, 'encrypt');
        const result = await firebaseApp.functions.function('criticism').function('edit').call({
            editType: 'add',
            criticismId: criticismId.guidString,
            criticism: {
                type: 'suggestion',
                title: 'title-2',
                description: 'description-2',
                workedOff: true
            }
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'Couldn\'t add existing criticism suggestion.'
        });
    });

    it('change criticism not given over', async () => {
        const result = await firebaseApp.functions.function('criticism').function('edit').call({
            editType: 'change',
            criticismId: Guid.newGuid().guidString,
            criticism: null
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'No criticism suggestion in parameters to add / change.'
        });
    });

    it('change criticism not existing', async () => {
        const criticismId = Guid.newGuid();
        const result = await firebaseApp.functions.function('criticism').function('edit').call({
            editType: 'change',
            criticismId: criticismId.guidString,
            criticism: {
                type: 'criticism',
                title: 'title',
                description: 'description',
                workedOff: false
            }
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'Couldn\'t change not existing criticism suggestion.'
        });
    });

    it('change criticism existing', async () => {
        const criticismId = Guid.newGuid();
        await firebaseApp.database.child('criticisms').child(criticismId.guidString).set({
            type: 'criticism',
            title: 'title',
            description: 'description',
            workedOff: false
        }, 'encrypt');
        const result = await firebaseApp.functions.function('criticism').function('edit').call({
            editType: 'change',
            criticismId: criticismId.guidString,
            criticism: {
                type: 'suggestion',
                title: 'title-2',
                description: 'description-2',
                workedOff: true
            }
        });
        result.success;
        expect(await firebaseApp.database.child('criticisms').child(criticismId.guidString).get('decrypt')).to.be.deep.equal({
            type: 'suggestion',
            title: 'title-2',
            description: 'description-2',
            workedOff: true
        });
    });
});
