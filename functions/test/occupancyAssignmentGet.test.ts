import { Guid } from '../src/types/Guid';
import { UtcDate } from '../src/types/UtcDate';
import { cleanUpFirebase, firebaseApp } from './firebaseApp';

describe('occupancyAssignmentGet', () => {
    afterEach(async () => {
        await cleanUpFirebase();
    });

    it('get assignments', async () => {
        const locationId1 = Guid.newGuid();
        await firebaseApp.database.child('occupancy').child('locations').child(locationId1.guidString).set({
            name: 'location 1',
            color: '#3A894F'
        }, 'encrypt');
        const locationId2 = Guid.newGuid();
        await firebaseApp.database.child('occupancy').child('locations').child(locationId2.guidString).set({
            name: 'location 2',
            color: '#A842BB'
        }, 'encrypt');
        const endDate = UtcDate.now.advanced({ minute: 100 });
        const date1 = UtcDate.now.advanced({ minute: 50 });
        const assignmentId1 = Guid.newGuid();
        await firebaseApp.database.child('occupancy').child('assignments').child(assignmentId1.guidString).set({
            locationIds: [locationId1.guidString],
            title: 'assignment 1',
            startDate: date1.encoded,
            endDate: endDate.encoded
        }, 'encrypt');
        const date2 = UtcDate.now.advanced({ minute: 30 });
        const assignmentId2 = Guid.newGuid();
        await firebaseApp.database.child('occupancy').child('assignments').child(assignmentId2.guidString).set({
            locationIds: [locationId2.guidString],
            title: 'assignment 2',
            startDate: date2.encoded,
            endDate: endDate.encoded
        }, 'encrypt');
        const date3 = UtcDate.now.advanced({ minute: 20 });
        const assignmentId3 = Guid.newGuid();
        await firebaseApp.database.child('occupancy').child('assignments').child(assignmentId3.guidString).set({
            locationIds: [locationId2.guidString],
            title: 'assignment 3',
            startDate: date3.encoded,
            endDate: endDate.encoded
        }, 'encrypt');
        const date4 = UtcDate.now.advanced({ minute: -30 });
        const assignmentId4 = Guid.newGuid();
        await firebaseApp.database.child('occupancy').child('assignments').child(assignmentId4.guidString).set({
            locationIds: [locationId1.guidString, locationId2.guidString],
            title: 'assignment 4',
            startDate: date4.encoded,
            endDate: endDate.encoded
        }, 'encrypt');
        const result = await firebaseApp.functions.function('occupancy').function('assignment').function('get').call({});
        result.success.equal({
            locations: {
                [locationId1.guidString]: {
                    name: 'location 1',
                    color: '#3A894F'
                },
                [locationId2.guidString]: {
                    name: 'location 2',
                    color: '#A842BB'
                }
            },
            assignments: [
                {
                    id: assignmentId4.guidString,
                    locationIds: [locationId1.guidString, locationId2.guidString],
                    title: 'assignment 4',
                    startDate: date4.encoded,
                    endDate: endDate.encoded
                },
                {
                    id: assignmentId3.guidString,
                    locationIds: [locationId2.guidString],
                    title: 'assignment 3',
                    startDate: date3.encoded,
                    endDate: endDate.encoded
                },
                {
                    id: assignmentId2.guidString,
                    locationIds: [locationId2.guidString],
                    title: 'assignment 2',
                    startDate: date2.encoded,
                    endDate: endDate.encoded
                },
                {
                    id: assignmentId1.guidString,
                    locationIds: [locationId1.guidString],
                    title: 'assignment 1',
                    startDate: date1.encoded,
                    endDate: endDate.encoded
                }
            ]
        });
    });
});
