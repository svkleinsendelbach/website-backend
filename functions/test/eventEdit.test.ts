import { expect } from 'firebase-function/lib/src/testUtils';
import { Guid } from '../src/types/Guid';
import { authenticateTestUser, cleanUpFirebase, firebaseApp } from './firebaseApp';

describe('eventEdit', () => {
    beforeEach(async () => {
        await authenticateTestUser();
    });

    afterEach(async () => {
        await cleanUpFirebase();
    });

    it('remove event not existing', async () => {
        const result = await firebaseApp.functions.function('event').function('edit').call({
            editType: 'remove',
            groupId: 'general',
            previousGroupId: undefined,
            eventId: Guid.newGuid().guidString,
            event: undefined
        });
        result.success;
    });

    it('remove event existing', async () => {
        const eventId = Guid.newGuid();
        await firebaseApp.database.child('events').child('general').child(eventId.guidString).set({
            date: new Date().toISOString(),
            title: 'title'
        }, 'encrypt');
        const result = await firebaseApp.functions.function('event').function('edit').call({
            editType: 'remove',
            groupId: 'general',
            previousGroupId: undefined,
            eventId: eventId.guidString,
            event: undefined
        });
        result.success;
        expect(await firebaseApp.database.child('events').child('general').child(eventId.guidString).exists()).to.be.equal(false);
    });

    it('add event not given over', async () => {
        const result = await firebaseApp.functions.function('event').function('edit').call({
            editType: 'add',
            groupId: 'general',
            previousGroupId: undefined,
            eventId: Guid.newGuid().guidString,
            event: undefined
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'No event in parameters to add / change.'
        });
    });

    it('add event not existing', async () => {
        const eventId = Guid.newGuid();
        const date = new Date();
        const result = await firebaseApp.functions.function('event').function('edit').call({
            editType: 'add',
            groupId: 'general',
            previousGroupId: undefined,
            eventId: eventId.guidString,
            event: {
                date: date.toISOString(),
                title: 'title'
            }
        });
        result.success;
        expect(await firebaseApp.database.child('events').child('general').child(eventId.guidString).get('decrypt')).to.be.deep.equal({
            date: date.toISOString(),
            title: 'title'
        });
    });

    it('add event existing', async () => {
        const eventId = Guid.newGuid();
        const date1 = new Date();
        await firebaseApp.database.child('events').child('general').child(eventId.guidString).set({
            date: date1.toISOString(),
            title: 'title-1'
        }, 'encrypt');
        const date2 = new Date(date1.getTime() + 60000);
        const result = await firebaseApp.functions.function('event').function('edit').call({
            editType: 'add',
            groupId: 'general',
            previousGroupId: undefined,
            eventId: eventId.guidString,
            event: {
                date: date2.toISOString(),
                title: 'title-2'
            }
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'Couldn\'t add existing event.'
        });
    });

    it('change event not given over', async () => {
        const result = await firebaseApp.functions.function('event').function('edit').call({
            editType: 'change',
            groupId: 'general',
            previousGroupId: 'general',
            eventId: Guid.newGuid().guidString,
            event: undefined
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'No event in parameters to add / change.'
        });
    });

    it('change event not existing', async () => {
        const result = await firebaseApp.functions.function('event').function('edit').call({
            editType: 'change',
            groupId: 'general',
            previousGroupId: 'general',
            eventId: Guid.newGuid().guidString,
            event: {
                date: new Date().toISOString(),
                title: 'title'
            }
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'Couldn\'t change not existing event.'
        });
    });

    it('change event existing', async () => {
        const eventId = Guid.newGuid();
        const date1 = new Date();
        await firebaseApp.database.child('events').child('general').child(eventId.guidString).set({
            date: date1.toISOString(),
            title: 'title-1'
        }, 'encrypt');
        const date2 = new Date(date1.getTime() + 60000);
        const result = await firebaseApp.functions.function('event').function('edit').call({
            editType: 'change',
            groupId: 'general',
            previousGroupId: 'general',
            eventId: eventId.guidString,
            event: {
                date: date2.toISOString(),
                title: 'title-2'
            }
        });
        result.success;
        expect(await firebaseApp.database.child('events').child('general').child(eventId.guidString).get('decrypt')).to.be.deep.equal({
            date: date2.toISOString(),
            title: 'title-2'
        });
    });

    it('change event previous group id undefined', async () => {
        const eventId = Guid.newGuid();
        const date1 = new Date();
        await firebaseApp.database.child('events').child('general').child(eventId.guidString).set({
            date: date1.toISOString(),
            title: 'title-1'
        }, 'encrypt');
        const date2 = new Date(date1.getTime() + 60000);
        const result = await firebaseApp.functions.function('event').function('edit').call({
            editType: 'change',
            groupId: 'dancing',
            previousGroupId: undefined,
            eventId: eventId.guidString,
            event: {
                date: date2.toISOString(),
                title: 'title-2'
            }
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'No previous group id in parameters to change.'
        });
    });

    it('change event group id', async () => {
        const eventId = Guid.newGuid();
        const date1 = new Date();
        await firebaseApp.database.child('events').child('general').child(eventId.guidString).set({
            date: date1.toISOString(),
            title: 'title-1'
        }, 'encrypt');
        const date2 = new Date(date1.getTime() + 60000);
        const result = await firebaseApp.functions.function('event').function('edit').call({
            editType: 'change',
            groupId: 'dancing',
            previousGroupId: 'general',
            eventId: eventId.guidString,
            event: {
                date: date2.toISOString(),
                title: 'title-2'
            }
        });
        result.success;
        expect(await firebaseApp.database.child('events').child('general').child(eventId.guidString).exists()).to.be.equal(false);
        expect(await firebaseApp.database.child('events').child('dancing').child(eventId.guidString).get('decrypt')).to.be.deep.equal({
            date: date2.toISOString(),
            title: 'title-2'
        });
    });
});
