import { expect } from 'firebase-function/lib/src/testUtils';
import { Guid } from '../src/types/Guid';
import { authenticateTestUser, cleanUpFirebase, firebaseApp } from './firebaseApp';

describe('occupancyLocationEdit', () => {
    beforeEach(async () => {
        await authenticateTestUser();
    });

    afterEach(async () => {
        await cleanUpFirebase();
    });

    it('remove location not existing', async () => {
        const result = await firebaseApp.functions.function('occupancy').function('location').function('edit').call({
            editType: 'remove',
            locationId: Guid.newGuid().guidString,
            location: undefined
        });
        result.success;
    });

    it('remove location existing', async () => {
        const locationId = Guid.newGuid();
        await firebaseApp.database.child('occupancy').child('locations').child(locationId.guidString).set({
            name: 'sportshome',
            color: '#AB59D3'
        }, 'encrypt');
        const result = await firebaseApp.functions.function('occupancy').function('location').function('edit').call({
            editType: 'remove',
            locationId: locationId.guidString,
            location: undefined
        });
        result.success;
        expect(await firebaseApp.database.child('occupancy').child('locations').child(locationId.guidString).exists()).to.be.equal(false);
    });

    it('add location not given over', async () => {
        const result = await firebaseApp.functions.function('occupancy').function('location').function('edit').call({
            editType: 'add',
            locationId: Guid.newGuid().guidString,
            location: undefined
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'No location in parameters to add / change.'
        });
    });

    it('add location not existing', async () => {
        const locationId = Guid.newGuid();
        const result = await firebaseApp.functions.function('occupancy').function('location').function('edit').call({
            editType: 'add',
            locationId: locationId.guidString,
            location: {
                name: 'sportshome',
                color: '#AB59D3'
            }
        });
        result.success;
        expect(await firebaseApp.database.child('occupancy').child('locations').child(locationId.guidString).get('decrypt')).to.be.deep.equal({
            name: 'sportshome',
            color: '#AB59D3'
        });
    });

    it('add location existing', async () => {
        const locationId = Guid.newGuid();
        await firebaseApp.database.child('occupancy').child('locations').child(locationId.guidString).set({
            name: 'asdf',
            color: '#ABCDEF'
        }, 'encrypt');
        const result = await firebaseApp.functions.function('occupancy').function('location').function('edit').call({
            editType: 'add',
            locationId: locationId.guidString,
            location: {
                name: 'sportshome',
                color: '#AB59D3'
            }
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'Couldn\'t add existing location.'
        });
    });

    it('change location not given over', async () => {
        const result = await firebaseApp.functions.function('occupancy').function('location').function('edit').call({
            editType: 'change',
            locationId: Guid.newGuid().guidString,
            location: undefined
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'No location in parameters to add / change.'
        });
    });

    it('change event not existing', async () => {
        const result = await firebaseApp.functions.function('occupancy').function('location').function('edit').call({
            editType: 'change',
            locationId: Guid.newGuid().guidString,
            location: {
                name: 'sportshome',
                color: '#AB59D3'
            }
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'Couldn\'t change not existing location.'
        });
    });

    it('change event existing', async () => {
        const locationId = Guid.newGuid();
        await firebaseApp.database.child('occupancy').child('locations').child(locationId.guidString).set({
            name: 'asdfln',
            color: '#123456'
        }, 'encrypt');
        const result = await firebaseApp.functions.function('occupancy').function('location').function('edit').call({
            editType: 'change',
            locationId: locationId.guidString,
            location: {
                name: 'sportshome',
                color: '#AB59D3'
            }
        });
        result.success;
        expect(await firebaseApp.database.child('occupancy').child('locations').child(locationId.guidString).get('decrypt')).to.be.deep.equal({
            name: 'sportshome',
            color: '#AB59D3'
        });
    });
});
