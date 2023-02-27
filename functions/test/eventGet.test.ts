import { FirebaseApp, expectResult } from 'firebase-function/lib/src/testUtils';
import { Guid } from '../src/classes/Guid';
import { type DeleteAllDataFunction } from '../src/functions/DeleteAllDataFunction';
import { type EventGetFunction } from '../src/functions/EventGetFunction';
import { type Event } from '../src/types/Event';
import { cryptionKeys, callSecretKey, firebaseConfig } from './privateKeys';

describe('eventGet', () => {
    const firebaseApp = new FirebaseApp(firebaseConfig, cryptionKeys, callSecretKey, {
        functionsRegion: 'europe-west1',
        databaseUrl: firebaseConfig.databaseURL
    });

    afterEach(async() => {
        const result = await firebaseApp.functions.call<DeleteAllDataFunction.Parameters, DeleteAllDataFunction.ReturnType>('deleteAllData', {});
        expectResult(result).success;
    });

    it('get events', async() => {
        const date1 = new Date(new Date().getTime() + 50000);
        const eventId1 = Guid.newGuid();
        await firebaseApp.database.setEncrypted<Omit<Event.Flatten, 'id'>>(`events/general/${eventId1.guidString}`, {
            date: date1.toISOString(),
            title: 'event-1'
        });
        const date2 = new Date(new Date().getTime() + 30000);
        const eventId2 = Guid.newGuid();
        await firebaseApp.database.setEncrypted<Omit<Event.Flatten, 'id'>>(`events/general/${eventId2.guidString}`, {
            date: date2.toISOString(),
            title: 'event-2'
        });
        const date3 = new Date(new Date().getTime() + 20000);
        const eventId3 = Guid.newGuid();
        await firebaseApp.database.setEncrypted<Omit<Event.Flatten, 'id'>>(`events/football-adults/first-team/${eventId3.guidString}`, {
            date: date3.toISOString(),
            title: 'event-3'
        });
        const date4 = new Date(new Date().getTime() - 30000);
        const eventId4 = Guid.newGuid();
        await firebaseApp.database.setEncrypted<Omit<Event.Flatten, 'id'>>(`events/football-adults/first-team/${eventId4.guidString}`, {
            date: date4.toISOString(),
            title: 'event-4'
        });
        const result = await firebaseApp.functions.call<EventGetFunction.Parameters, EventGetFunction.ReturnType>('eventGet', {
            groupIds: ['general', 'football-adults/first-team']
        });
        expectResult(result).success.to.be.deep.equal([
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
