import { Guid } from "../src/types/Guid";
import { UtcDate } from "../src/types/UtcDate";
import { authenticateTestUser, cleanUpFirebase, firebaseApp } from "./firebaseApp";

describe('eventGet', () => {
    beforeEach(async () => {
        await authenticateTestUser();
    });
    
    afterEach(async () => {
        await cleanUpFirebase();
    });

    it('get events', async () => {
        const date1 = UtcDate.now.advanced({ minute: 50 });
        const eventId1 = Guid.newGuid();
        await firebaseApp.database.child('events').child('dancing').child(eventId1.guidString).set({
            date: date1.encoded,
            title: 'event-1',
            isImportant: false
        }, 'encrypt');
        const date2 = UtcDate.now.advanced({ minute: 30 });
        const eventId2 = Guid.newGuid();
        await firebaseApp.database.child('events').child('general').child(eventId2.guidString).set({
            date: date2.encoded,
            title: 'event-2',
            isImportant: false
        }, 'encrypt');
        const date3 = UtcDate.now.advanced({ minute: 20 });
        const eventId3 = Guid.newGuid();
        const result1 = await firebaseApp.functions.function('event').function('edit').call({
            editType: 'add',
            groupId: 'general',
            previousGroupId: 'general',
            eventId: eventId3.guidString,
            event: {
                date: date3.encoded,
                title: 'event-3',
                isImportant: false
            }
        });
        result1.success;
        const result2 = await firebaseApp.functions.function('event').function('edit').call({
            editType: 'change',
            groupId: 'dancing',
            previousGroupId: 'dancing',
            eventId: eventId1.guidString,
            event: {
                date: date1.encoded,
                title: 'event-1',
                isImportant: true
            }
        });
        result2.success;
        const result3 = await firebaseApp.functions.function('event').function('edit').call({
            editType: 'remove',
            groupId: 'general',
            previousGroupId: 'general',
            eventId: eventId2.guidString,
            event: undefined
        });
        result3.success;
        const result = await firebaseApp.functions.function('event').function('getChanges').call({
            groupIds: ['dancing', 'general'],
            upToDate: UtcDate.now.advanced({ day: -1 }).encoded
        });
        result.success.equal([
            {
                groupId: 'dancing',
                events: [
                    {
                        id: eventId1.guidString,
                        date: date1.encoded,
                        title: 'event-1',
                        isImportant: true
                    }
                ]
            },
            {
                groupId: 'general',
                events: [
                    {
                        id: eventId3.guidString,
                        date: date3.encoded,
                        title: 'event-3',
                        isImportant: false
                    },
                    {
                        id: eventId2.guidString,
                        state: 'deleted'
                    }
                ]
            }
        ]);
    });
});