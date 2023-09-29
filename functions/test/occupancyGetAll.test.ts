import { Guid } from 'firebase-function';
import { UtcDate } from 'firebase-function';
import { authenticateTestUser, cleanUpFirebase, firebaseApp } from './firebaseApp';
import { Occupancy } from '../src/types/Occupancy';

describe('occupancyGetAll', () => {
    beforeEach(async () => {
        await authenticateTestUser();
    });
    
    afterEach(async () => {
        await cleanUpFirebase();
    });

    async function addOccupancy(number: number): Promise<Omit<Occupancy.Flatten, 'discordMessageId'>> {
        const occupancy: Omit<Occupancy.Flatten, 'id' | 'discordMessageId'> = {
            location: 'sportshome',
            title: `title-${number}`,
            start: UtcDate.now.advanced({ minute: number * 100 }).encoded,
            end: UtcDate.now.advanced({ minute: 30 + number * 100 }).encoded,
            recurring: Math.random() <= 0.5 ? null : {
                untilIncluding: UtcDate.now.advanced({ minute: 60 + number * 100 }).encoded,
                repeatEvery: 'day',
                excludingDates: [
                    UtcDate.now.advanced({ minute: 40 + number * 100 }).encoded,
                    UtcDate.now.advanced({ minute: 50 + number * 100 }).encoded
                ]
            }
        };
        const occupancyId = Guid.newGuid();
        await firebaseApp.database.child('occupancies').child(occupancyId.guidString).set({
            ...occupancy,
            discordMessageId: null
        }, 'encrypt');
        return {
            ...occupancy,
            id: occupancyId.guidString,
        };
    }

    it('get all occupancies', async () => {
        const occupancy1 = await addOccupancy(1);
        const occupancy2 = await addOccupancy(2);
        const occupancy3 = await addOccupancy(3);
        const result = await firebaseApp.functions.function('occupancy').function('getAll').call({});
        result.success.unsorted([occupancy3, occupancy2, occupancy1]);
    });
});
