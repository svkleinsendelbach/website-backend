import { Guid } from '../src/types/Guid';
import { cleanUpFirebase, firebaseApp } from './firebaseApp';

describe('eventGet', () => {
    afterEach(async () => {
        await cleanUpFirebase();
    });

    it('get events', async () => {
        const date1 = new Date(new Date().getTime() + 50000);
        const eventId1 = Guid.newGuid();
        await firebaseApp.database.child('events').child('general').child(eventId1.guidString).set({
            date: date1.toISOString(),
            title: 'event-1'
        }, 'encrypt');
        const date2 = new Date(new Date().getTime() + 30000);
        const eventId2 = Guid.newGuid();
        await firebaseApp.database.child('events').child('general').child(eventId2.guidString).set({
            date: date2.toISOString(),
            title: 'event-2'
        }, 'encrypt');
        const date3 = new Date(new Date().getTime() + 20000);
        const eventId3 = Guid.newGuid();
        await firebaseApp.database.child('events').child('football-adults/first-team').child(eventId3.guidString).set({
            date: date3.toISOString(),
            title: 'event-3'
        }, 'encrypt');
        const date4 = new Date(new Date().getTime() - 30000);
        const eventId4 = Guid.newGuid();
        await firebaseApp.database.child('events').child('football-adults/first-team').child(eventId4.guidString).set({
            date: date4.toISOString(),
            title: 'event-4'
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
                        date: date2.toISOString(),
                        title: 'event-2'
                    },
                    {
                        id: eventId1.guidString,
                        date: date1.toISOString(),
                        title: 'event-1'
                    }
                ]
            },
            {
                groupId: 'football-adults/first-team',
                events: [
                    {
                        id: eventId3.guidString,
                        date: date3.toISOString(),
                        title: 'event-3'
                    }
                ]
            }
        ]);
    });
});
