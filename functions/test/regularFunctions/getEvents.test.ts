import { guid } from '../../src/classes/guid';
import { Crypter } from '../../src/crypter/Crypter';
import { cryptionKeys } from '../privateKeys';
import { callFunction, expectSuccess, setDatabaseValue } from '../utils';

describe('get events', () => {
    afterEach(async () => {
        const result = await callFunction('deleteAllData', {});
        expectSuccess(result).to.be.equal(undefined);
    });

    it('get events', async () => {
        const crypter = new Crypter(cryptionKeys);
        const date1 = new Date(new Date().getTime() + 50000);
        const eventId1 = guid.newGuid();
        await setDatabaseValue(`events/general/${eventId1.guidString}`, crypter.encodeEncrypt({
            date: date1.toISOString(),
            title: 'event1'
        }));
        const date2 = new Date(new Date().getTime() + 30000);
        const eventId2 = guid.newGuid();
        await setDatabaseValue(`events/general/${eventId2.guidString}`, crypter.encodeEncrypt({
            date: date2.toISOString(),
            title: 'event2'
        }));
        const date3 = new Date(new Date().getTime() + 20000);
        const eventId3 = guid.newGuid();
        await setDatabaseValue(`events/football-adults/first-team/${eventId3.guidString}`, crypter.encodeEncrypt({
            date: date3.toISOString(),
            title: 'event3'
        }));
        const date4 = new Date(new Date().getTime() - 30000);
        const eventId4 = guid.newGuid();
        await setDatabaseValue(`events/football-adults/first-team/${eventId4.guidString}`, crypter.encodeEncrypt({
            date: date4.toISOString(),
            title: 'event4'
        }));
        const result = await callFunction('getEvents', {
            groupIds: ['general', 'football-adults/first-team']
        });
        expectSuccess(result).to.be.deep.equal([
            {
                groupId: 'general',
                events: [
                    {
                        id: eventId2.guidString,
                        date: date2.toISOString(),
                        title: 'event2'
                    }, 
                    {
                        id: eventId1.guidString,
                        date: date1.toISOString(),
                        title: 'event1'
                    }
                ]
            },
            {
                groupId: 'football-adults/first-team',
                events: [
                    {
                        id: eventId3.guidString,
                        date: date3.toISOString(),
                        title: 'event3'
                    }
                ]
            }
        ]);
    });
});
