import { expect } from 'firebase-function/lib/src/testUtils';
import { Guid } from '../src/types/Guid';
import { authenticateTestUser, cleanUpFirebase, firebaseApp } from './firebaseApp';
import { UtcDate } from '../src/types/UtcDate';

describe('eventEdit', () => {
    beforeEach(async () => {
        await authenticateTestUser();
    });

    afterEach(async () => {
        await cleanUpFirebase();
    });

    it('remove event not existing', async () => {
        const eventId = Guid.newGuid();
        const result = await firebaseApp.functions.function('event').function('edit').call({
            editType: 'remove',
            groupId: 'general',
            previousGroupId: undefined,
            eventId: eventId.guidString,
            event: undefined
        });
        result.success;
        const changes = await firebaseApp.database.child('events').child('general').child('changes').child(UtcDate.now.setted({ hour: 0, minute: 0}).encoded).get();
        expect(Object.values(changes).includes(eventId.guidString)).to.be.equal(true);
    });

    it('remove event existing', async () => {
        const eventId = Guid.newGuid();
        await firebaseApp.database.child('events').child('general').child(eventId.guidString).set({
            date: UtcDate.now.encoded,
            title: 'title',
            isImportant: false
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
        const changes = await firebaseApp.database.child('events').child('general').child('changes').child(UtcDate.now.setted({ hour: 0, minute: 0}).encoded).get();
        expect(Object.values(changes).includes(eventId.guidString)).to.be.equal(true);
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
        const date = UtcDate.now;
        const result = await firebaseApp.functions.function('event').function('edit').call({
            editType: 'add',
            groupId: 'general',
            previousGroupId: undefined,
            eventId: eventId.guidString,
            event: {
                date: date.encoded,
                title: 'title',
                isImportant: true
            }
        });
        result.success;
        expect(await firebaseApp.database.child('events').child('general').child(eventId.guidString).get('decrypt')).to.be.deep.equal({
            date: date.encoded,
            title: 'title',
            isImportant: true
        });
        const changes = await firebaseApp.database.child('events').child('general').child('changes').child(UtcDate.now.setted({ hour: 0, minute: 0}).encoded).get();
        expect(Object.values(changes).includes(eventId.guidString)).to.be.equal(true);
    });

    it('add event existing', async () => {
        const eventId = Guid.newGuid();
        const date1 = UtcDate.now;
        await firebaseApp.database.child('events').child('general').child(eventId.guidString).set({
            date: date1.encoded,
            title: 'title-1',
            isImportant: false
        }, 'encrypt');
        const date2 = UtcDate.now.advanced({ hour: 1 });
        const result = await firebaseApp.functions.function('event').function('edit').call({
            editType: 'add',
            groupId: 'general',
            previousGroupId: undefined,
            eventId: eventId.guidString,
            event: {
                date: date2.encoded,
                title: 'title-2',
                isImportant: false
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
                date: UtcDate.now.encoded,
                title: 'title',
                isImportant: false
            }
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'Couldn\'t change not existing event.'
        });
    });

    it('change event existing', async () => {
        const eventId = Guid.newGuid();
        const date1 = UtcDate.now;
        await firebaseApp.database.child('events').child('general').child(eventId.guidString).set({
            date: date1.encoded,
            title: 'title-1',
            isImportant: false
        }, 'encrypt');
        const date2 = date1.advanced({ hour: 1 });
        const result = await firebaseApp.functions.function('event').function('edit').call({
            editType: 'change',
            groupId: 'general',
            previousGroupId: 'general',
            eventId: eventId.guidString,
            event: {
                date: date2.encoded,
                title: 'title-2',
                isImportant: false
            }
        });
        result.success;
        expect(await firebaseApp.database.child('events').child('general').child(eventId.guidString).get('decrypt')).to.be.deep.equal({
            date: date2.encoded,
            title: 'title-2',
            isImportant: false
        });
        const changes = await firebaseApp.database.child('events').child('general').child('changes').child(UtcDate.now.setted({ hour: 0, minute: 0}).encoded).get();
        expect(Object.values(changes).includes(eventId.guidString)).to.be.equal(true);
    });

    it('change event previous group id undefined', async () => {
        const eventId = Guid.newGuid();
        const date1 = UtcDate.now;
        await firebaseApp.database.child('events').child('general').child(eventId.guidString).set({
            date: date1.encoded,
            title: 'title-1',
            isImportant: false
        }, 'encrypt');
        const date2 = date1.advanced({ hour: 1 });
        const result = await firebaseApp.functions.function('event').function('edit').call({
            editType: 'change',
            groupId: 'dancing',
            previousGroupId: undefined,
            eventId: eventId.guidString,
            event: {
                date: date2.encoded,
                title: 'title-2',
                isImportant: false
            }
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'No previous group id in parameters to change.'
        });
    });

    it('change event group id', async () => {
        const eventId = Guid.newGuid();
        const date1 = UtcDate.now;
        await firebaseApp.database.child('events').child('general').child(eventId.guidString).set({
            date: date1.encoded,
            title: 'title-1',
            isImportant: false
        }, 'encrypt');
        const date2 = date1.advanced({ hour: 1 });
        const result = await firebaseApp.functions.function('event').function('edit').call({
            editType: 'change',
            groupId: 'dancing',
            previousGroupId: 'general',
            eventId: eventId.guidString,
            event: {
                date: date2.encoded,
                title: 'title-2',
                isImportant: false
            }
        });
        result.success;
        expect(await firebaseApp.database.child('events').child('general').child(eventId.guidString).exists()).to.be.equal(false);
        expect(await firebaseApp.database.child('events').child('dancing').child(eventId.guidString).get('decrypt')).to.be.deep.equal({
            date: date2.encoded,
            title: 'title-2',
            isImportant: false
        });
        const changes1 = await firebaseApp.database.child('events').child('general').child('changes').child(UtcDate.now.setted({ hour: 0, minute: 0}).encoded).get();
        expect(Object.values(changes1).includes(eventId.guidString)).to.be.equal(true);
        const changes2 = await firebaseApp.database.child('events').child('dancing').child('changes').child(UtcDate.now.setted({ hour: 0, minute: 0}).encoded).get();
        expect(Object.values(changes2).includes(eventId.guidString)).to.be.equal(true);
    });
});
