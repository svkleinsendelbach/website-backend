import { Guid } from '../src/types/Guid';
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
        const endDate = new Date(new Date().getTime() + 100000);
        const date1 = new Date(new Date().getTime() + 50000);
        const assignmentId1 = Guid.newGuid();
        await firebaseApp.database.child('occupancy').child('assignments').child(assignmentId1.guidString).set({
            locationId: locationId1.guidString,
            title: 'assignment 1',
            startDate: date1.toISOString(),
            endDate: endDate.toISOString()
        }, 'encrypt');
        const date2 = new Date(new Date().getTime() + 30000);
        const assignmentId2 = Guid.newGuid();
        await firebaseApp.database.child('occupancy').child('assignments').child(assignmentId2.guidString).set({
            locationId: locationId2.guidString,
            title: 'assignment 2',
            startDate: date2.toISOString(),
            endDate: endDate.toISOString()
        }, 'encrypt');
        const date3 = new Date(new Date().getTime() + 20000);
        const assignmentId3 = Guid.newGuid();
        await firebaseApp.database.child('occupancy').child('assignments').child(assignmentId3.guidString).set({
            locationId: locationId2.guidString,
            title: 'assignment 3',
            startDate: date3.toISOString(),
            endDate: endDate.toISOString()
        }, 'encrypt');
        const date4 = new Date(new Date().getTime() - 30000);
        const assignmentId4 = Guid.newGuid();
        await firebaseApp.database.child('occupancy').child('assignments').child(assignmentId4.guidString).set({
            locationId: locationId1.guidString,
            title: 'assignment 4',
            startDate: date4.toISOString(),
            endDate: endDate.toISOString()
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
                    locationId: locationId1.guidString,
                    title: 'assignment 4',
                    startDate: date4.toISOString(),
                    endDate: endDate.toISOString()
                },
                {
                    id: assignmentId3.guidString,
                    locationId: locationId2.guidString,
                    title: 'assignment 3',
                    startDate: date3.toISOString(),
                    endDate: endDate.toISOString()
                },
                {
                    id: assignmentId2.guidString,
                    locationId: locationId2.guidString,
                    title: 'assignment 2',
                    startDate: date2.toISOString(),
                    endDate: endDate.toISOString()
                },
                {
                    id: assignmentId1.guidString,
                    locationId: locationId1.guidString,
                    title: 'assignment 1',
                    startDate: date1.toISOString(),
                    endDate: endDate.toISOString()
                }
            ]
        });
    });
});
