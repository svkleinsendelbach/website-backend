import { expect } from 'firebase-function/lib/src/testUtils';
import { Guid } from '../src/types/Guid';
import { authenticateTestUser, cleanUpFirebase, firebaseApp } from './firebaseApp';

describe('occupancyAssignmentEdit', () => {
    beforeEach(async () => {
        await authenticateTestUser();
    });

    afterEach(async () => {
        await cleanUpFirebase();
    });

    it('remove assignment not existing', async () => {
        const result = await firebaseApp.functions.function('occupancy').function('assignment').function('edit').call({
            editType: 'remove',
            assignmentId: Guid.newGuid().guidString,
            assignment: undefined
        });
        result.success;
    });

    it('remove assignment existing', async () => {
        const assignmentId = Guid.newGuid();
        await firebaseApp.database.child('occupancy').child('assignments').child(assignmentId.guidString).set({
            locationId: Guid.newGuid().guidString,
            title: 'klmoi',
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString()
        }, 'encrypt');
        const result = await firebaseApp.functions.function('occupancy').function('assignment').function('edit').call({
            editType: 'remove',
            assignmentId: assignmentId.guidString,
            assignment: undefined
        });
        result.success;
        expect(await firebaseApp.database.child('occupancy').child('assignments').child(assignmentId.guidString).exists()).to.be.equal(false);
    });

    it('add assignment not given over', async () => {
        const result = await firebaseApp.functions.function('occupancy').function('assignment').function('edit').call({
            editType: 'add',
            assignmentId: Guid.newGuid().guidString,
            assignment: undefined
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'No assignment in parameters to add / change.'
        });
    });

    it('add assignment not existing', async () => {
        const assignmentId = Guid.newGuid();
        const locationId = Guid.newGuid();
        const startDate = new Date();
        const endDate = new Date();
        const result = await firebaseApp.functions.function('occupancy').function('assignment').function('edit').call({
            editType: 'add',
            assignmentId: assignmentId.guidString,
            assignment: {
                locationId: locationId.guidString,
                title: 'klmoi',
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            }
        });
        result.success;
        expect(await firebaseApp.database.child('occupancy').child('assignments').child(assignmentId.guidString).get('decrypt')).to.be.deep.equal({
            locationId: locationId.guidString,
            title: 'klmoi',
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        });
    });

    it('add assignment existing', async () => {
        const assignmentId = Guid.newGuid();
        await firebaseApp.database.child('occupancy').child('assignments').child(assignmentId.guidString).set({
            locationId: Guid.newGuid().guidString,
            title: 'vadsfd',
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString()
        }, 'encrypt');
        const result = await firebaseApp.functions.function('occupancy').function('assignment').function('edit').call({
            editType: 'add',
            assignmentId: assignmentId.guidString,
            assignment: {
                locationId: Guid.newGuid().guidString,
                title: 'klmoi',
                startDate: new Date().toISOString(),
                endDate: new Date().toISOString()
            }
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'Couldn\'t add existing assignment.'
        });
    });

    it('change assignment not given over', async () => {
        const result = await firebaseApp.functions.function('occupancy').function('assignment').function('edit').call({
            editType: 'change',
            assignmentId: Guid.newGuid().guidString,
            assignment: undefined
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'No assignment in parameters to add / change.'
        });
    });

    it('change event not existing', async () => {
        const result = await firebaseApp.functions.function('occupancy').function('assignment').function('edit').call({
            editType: 'change',
            assignmentId: Guid.newGuid().guidString,
            assignment: {
                locationId: Guid.newGuid().guidString,
                title: 'klmoi',
                startDate: new Date().toISOString(),
                endDate: new Date().toISOString()
            }
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'Couldn\'t change not existing assignment.'
        });
    });

    it('change event existing', async () => {
        const assignmentId = Guid.newGuid();
        await firebaseApp.database.child('occupancy').child('assignments').child(assignmentId.guidString).set({
            locationId: Guid.newGuid().guidString,
            title: 'vasgf',
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString()
        }, 'encrypt');
        const locationId = Guid.newGuid();
        const startDate = new Date();
        const endDate = new Date();
        const result = await firebaseApp.functions.function('occupancy').function('assignment').function('edit').call({
            editType: 'change',
            assignmentId: assignmentId.guidString,
            assignment: {
                locationId: locationId.guidString,
                title: 'klmoi',
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            }
        });
        result.success;
        expect(await firebaseApp.database.child('occupancy').child('assignments').child(assignmentId.guidString).get('decrypt')).to.be.deep.equal({
            locationId: locationId.guidString,
            title: 'klmoi',
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        });
    });
});
