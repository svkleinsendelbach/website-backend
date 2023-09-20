import { expect } from 'firebase-function/lib/src/testUtils';
import { Guid } from '../src/types/Guid';
import { authenticateTestUser, cleanUpFirebase, firebaseApp } from './firebaseApp';
import { UtcDate } from 'firebase-function';

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
            previousGroupId: null,
            eventId: eventId.guidString,
            event: null
        });
        result.success;
    });

    it('remove event existing', async () => {
        const eventId = Guid.newGuid();
        await firebaseApp.database.child('events').child('general').child(eventId.guidString).set({
            date: UtcDate.now.encoded,
            title: 'title',
            isImportant: false,
            subtitle: null,
            link: null,
            discordMessageId: null
        }, 'encrypt');
        const result = await firebaseApp.functions.function('event').function('edit').call({
            editType: 'remove',
            groupId: 'general',
            previousGroupId: null,
            eventId: eventId.guidString,
            event: null
        });
        result.success;
        expect(await firebaseApp.database.child('events').child('general').child(eventId.guidString).exists()).to.be.equal(false);
    });

    it('add event not given over', async () => {
        const result = await firebaseApp.functions.function('event').function('edit').call({
            editType: 'add',
            groupId: 'general',
            previousGroupId: null,
            eventId: Guid.newGuid().guidString,
            event: null
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'No event in parameters to add.'
        });
    });

    it('add event not existing', async () => {
        const eventId = Guid.newGuid();
        const date = UtcDate.now;
        const result = await firebaseApp.functions.function('event').function('edit').call({
            editType: 'add',
            groupId: 'general',
            previousGroupId: null,
            eventId: eventId.guidString,
            event: {
                date: date.encoded,
                title: 'title',
                isImportant: true,
                subtitle: null,
                link: null
            }
        });
        result.success;
        expect(await firebaseApp.database.child('events').child('general').child(eventId.guidString).get('decrypt')).to.be.deep.equal({
            date: date.encoded,
            title: 'title',
            isImportant: true,
            subtitle: null,
            link: null,
            discordMessageId: null
        });
    });

    it('add event existing', async () => {
        const eventId = Guid.newGuid();
        const date1 = UtcDate.now;
        await firebaseApp.database.child('events').child('general').child(eventId.guidString).set({
            date: date1.encoded,
            title: 'title-1',
            isImportant: false,
            subtitle: null,
            link: null,
            discordMessageId: null
        }, 'encrypt');
        const date2 = UtcDate.now.advanced({ hour: 1 });
        const result = await firebaseApp.functions.function('event').function('edit').call({
            editType: 'add',
            groupId: 'general',
            previousGroupId: null,
            eventId: eventId.guidString,
            event: {
                date: date2.encoded,
                title: 'title-2',
                isImportant: false,
                subtitle: null,
                link: null
            }
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'Couldn\'t add existing event.'
        });
    });

    it('change event not given over', async () => {
        const eventId = Guid.newGuid();
        const date = UtcDate.now;
        await firebaseApp.database.child('events').child('general').child(eventId.guidString).set({
            date: date.encoded,
            title: 'title-1',
            isImportant: false,
            subtitle: null,
            link: null,
            discordMessageId: null
        }, 'encrypt');
        const result = await firebaseApp.functions.function('event').function('edit').call({
            editType: 'change',
            groupId: 'general',
            previousGroupId: 'general',
            eventId: eventId.guidString,
            event: null
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'No event in parameters to change.'
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
                isImportant: false,
                subtitle: null,
                link: null
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
            isImportant: false,
            subtitle: null,
            link: null,
            discordMessageId: null
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
                isImportant: false,
                subtitle: null,
                link: null
            }
        });
        result.success;
        expect(await firebaseApp.database.child('events').child('general').child(eventId.guidString).get('decrypt')).to.be.deep.equal({
            date: date2.encoded,
            title: 'title-2',
            isImportant: false,
            subtitle: null,
            link: null,
            discordMessageId: null
        });
    });

    it('change event previous group id null', async () => {
        const eventId = Guid.newGuid();
        const date1 = UtcDate.now;
        await firebaseApp.database.child('events').child('general').child(eventId.guidString).set({
            date: date1.encoded,
            title: 'title-1',
            isImportant: false,
            subtitle: null,
            link: null,
            discordMessageId: null
        }, 'encrypt');
        const date2 = date1.advanced({ hour: 1 });
        const result = await firebaseApp.functions.function('event').function('edit').call({
            editType: 'change',
            groupId: 'dancing',
            previousGroupId: null,
            eventId: eventId.guidString,
            event: {
                date: date2.encoded,
                title: 'title-2',
                isImportant: false,
                subtitle: null,
                link: null
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
            isImportant: false,
            subtitle: null,
            link: null,
            discordMessageId: null
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
                isImportant: false,
                subtitle: null,
                link: null
            }
        });
        result.success;
        expect(await firebaseApp.database.child('events').child('general').child(eventId.guidString).exists()).to.be.equal(false);
        expect(await firebaseApp.database.child('events').child('dancing').child(eventId.guidString).get('decrypt')).to.be.deep.equal({
            date: date2.encoded,
            title: 'title-2',
            isImportant: false,
            subtitle: null,
            link: null,
            discordMessageId: null
        });
    });
});
