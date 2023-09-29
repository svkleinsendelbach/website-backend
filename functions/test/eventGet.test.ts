import { Guid } from 'firebase-function';
import { UtcDate } from 'firebase-function';
import { cleanUpFirebase, firebaseApp } from './firebaseApp';

describe('eventGet', () => {
    afterEach(async () => {
        await cleanUpFirebase();
    });

    it('get events', async () => {
        const date1 = UtcDate.now.advanced({ minute: 50 });
        const eventId1 = Guid.newGuid();
        await firebaseApp.database.child('events').child('general').child(eventId1.guidString).set({
            date: date1.encoded,
            title: 'event-1',
            isImportant: false,
            subtitle: null,
            link: null,
            discordMessageId: null
        }, 'encrypt');
        const date2 = UtcDate.now.advanced({ minute: 30 });
        const eventId2 = Guid.newGuid();
        await firebaseApp.database.child('events').child('general').child(eventId2.guidString).set({
            date: date2.encoded,
            title: 'event-2',
            isImportant: false,
            subtitle: null,
            link: null,
            discordMessageId: null
        }, 'encrypt');
        const date3 = UtcDate.now.advanced({ minute: 20 });
        const eventId3 = Guid.newGuid();
        await firebaseApp.database.child('events').child('football-adults/first-team').child(eventId3.guidString).set({
            date: date3.encoded,
            title: 'event-3',
            isImportant: false,
            subtitle: null,
            link: null,
            discordMessageId: null
        }, 'encrypt');
        const date4 = UtcDate.now.advanced({ minute: -30 });
        const eventId4 = Guid.newGuid();
        await firebaseApp.database.child('events').child('football-adults/first-team').child(eventId4.guidString).set({
            date: date4.encoded,
            title: 'event-4',
            isImportant: false,
            subtitle: null,
            link: null,
            discordMessageId: null
        }, 'encrypt');
        const result = await firebaseApp.functions.function('event').function('get').call({
            groupIds: ['general', 'football-adults/first-team']
        });
        result.success.equal([
            {
                groupId: 'general',
                events: [
                    {
                        id: eventId2.guidString,
                        date: date2.encoded,
                        title: 'event-2',
                        isImportant: false,
                        subtitle: null,
                        link: null
                    },
                    {
                        id: eventId1.guidString,
                        date: date1.encoded,
                        title: 'event-1',
                        isImportant: false,
                        subtitle: null,
                        link: null
                    }
                ]
            },
            {
                groupId: 'football-adults/first-team',
                events: [
                    {
                        id: eventId3.guidString,
                        date: date3.encoded,
                        title: 'event-3',
                        isImportant: false,
                        subtitle: null,
                        link: null
                    }
                ]
            }
        ]);
    });
});
