import { expect } from 'firebase-function/lib/src/testUtils';
import { Guid } from '../src/types/Guid';
import { authenticateTestUser, cleanUpFirebase, firebaseApp } from './firebaseApp';

describe('criticismSuggestionEdit', () => {
    beforeEach(async () => {
        await authenticateTestUser();
    });

    afterEach(async () => {
        await cleanUpFirebase();
    });

    it('remove criticismSuggestion not existing', async () => {
        const criticismSuggestionId = Guid.newGuid();
        const result = await firebaseApp.functions.function('criticismSuggestion').function('edit').call({
            editType: 'remove',
            criticismSuggestionId: criticismSuggestionId.guidString,
            criticismSuggestion: null
        });
        result.success;
    });

    it('remove criticismSuggestion existing', async () => {
        const criticismSuggestionId = Guid.newGuid();
        await firebaseApp.database.child('criticismSuggestions').child(criticismSuggestionId.guidString).set({
            type: 'criticism',
            title: 'title',
            description: 'description',
            contactEmail: 'contactEmail',
            workedOff: false
        }, 'encrypt');
        const result = await firebaseApp.functions.function('criticismSuggestion').function('edit').call({
            editType: 'remove',
            criticismSuggestionId: criticismSuggestionId.guidString,
            criticismSuggestion: null
        });
        result.success;
        expect(await firebaseApp.database.child('criticismSuggestions').child(criticismSuggestionId.guidString).exists()).to.be.equal(false);
    });

    it('add criticismSuggestion not given over', async () => {
        const result = await firebaseApp.functions.function('criticismSuggestion').function('edit').call({
            editType: 'add',
            criticismSuggestionId: Guid.newGuid().guidString,
            criticismSuggestion: null
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'No criticism suggestion in parameters to add / change.'
        });
    });

    it('add criticismSuggestion not existing', async () => {
        const criticismSuggestionId = Guid.newGuid();
        const result = await firebaseApp.functions.function('criticismSuggestion').function('edit').call({
            editType: 'add',
            criticismSuggestionId: criticismSuggestionId.guidString,
            criticismSuggestion: {
                type: 'criticism',
                title: 'title',
                description: 'description',
                contactEmail: 'contactEmail',
                workedOff: false
            }
        });
        result.success;
        expect(await firebaseApp.database.child('criticismSuggestions').child(criticismSuggestionId.guidString).get('decrypt')).to.be.deep.equal({
            type: 'criticism',
            title: 'title',
            description: 'description',
            contactEmail: 'contactEmail',
            workedOff: false
        });
    });

    it('add criticismSuggestion existing', async () => {
        const criticismSuggestionId = Guid.newGuid();
        await firebaseApp.database.child('criticismSuggestions').child(criticismSuggestionId.guidString).set({
            type: 'criticism',
            title: 'title',
            description: 'description',
            contactEmail: 'contactEmail',
            workedOff: false
        }, 'encrypt');
        const result = await firebaseApp.functions.function('criticismSuggestion').function('edit').call({
            editType: 'add',
            criticismSuggestionId: criticismSuggestionId.guidString,
            criticismSuggestion: {
                type: 'suggestion',
                title: 'title-2',
                description: 'description-2',
                contactEmail: 'contactEmail-2',
                workedOff: true
            }
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'Couldn\'t add existing criticism suggestion.'
        });
    });

    it('change criticismSuggestion not given over', async () => {
        const result = await firebaseApp.functions.function('criticismSuggestion').function('edit').call({
            editType: 'change',
            criticismSuggestionId: Guid.newGuid().guidString,
            criticismSuggestion: null
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'No criticism suggestion in parameters to add / change.'
        });
    });

    it('change criticismSuggestion not existing', async () => {
        const criticismSuggestionId = Guid.newGuid();
        const result = await firebaseApp.functions.function('criticismSuggestion').function('edit').call({
            editType: 'change',
            criticismSuggestionId: criticismSuggestionId.guidString,
            criticismSuggestion: {
                type: 'criticism',
                title: 'title',
                description: 'description',
                contactEmail: 'contactEmail',
                workedOff: false
            }
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'Couldn\'t change not existing criticism suggestion.'
        });
    });

    it('change criticismSuggestion existing', async () => {
        const criticismSuggestionId = Guid.newGuid();
        await firebaseApp.database.child('criticismSuggestions').child(criticismSuggestionId.guidString).set({
            type: 'criticism',
            title: 'title',
            description: 'description',
            contactEmail: 'contactEmail',
            workedOff: false
        }, 'encrypt');
        const result = await firebaseApp.functions.function('criticismSuggestion').function('edit').call({
            editType: 'change',
            criticismSuggestionId: criticismSuggestionId.guidString,
            criticismSuggestion: {
                type: 'suggestion',
                title: 'title-2',
                description: 'description-2',
                contactEmail: 'contactEmail-2',
                workedOff: true
            }
        });
        result.success;
        expect(await firebaseApp.database.child('criticismSuggestions').child(criticismSuggestionId.guidString).get('decrypt')).to.be.deep.equal({
            type: 'suggestion',
            title: 'title-2',
            description: 'description-2',
            contactEmail: 'contactEmail-2',
            workedOff: true
        });
    });
});
