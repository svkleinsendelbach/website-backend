import { Crypter } from 'firebase-function';
import { FirebaseApp, expectResult, expect } from 'firebase-function/lib/src/testUtils';
import { Guid } from '../src/classes/Guid';
import { type DeleteAllDataFunction } from '../src/functions/DeleteAllDataFunction';
import { type EventEditFunction } from '../src/functions/EventEditFunction';
import { type UserAuthentication } from '../src/types/UserAuthentication';
import { cryptionKeys, callSecretKey, testUser, firebaseConfig } from './privateKeys';
import { type Event } from '../src/types/Event';

describe('eventEdit', () => {
    const firebaseApp = new FirebaseApp(firebaseConfig, cryptionKeys, callSecretKey, {
        functionsRegion: 'europe-west1',
        databaseUrl: firebaseConfig.databaseURL
    });

    beforeEach(async() => {
        await firebaseApp.auth.signIn(testUser.email, testUser.password);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await firebaseApp.database.setEncrypted<UserAuthentication>(`users/authentication/websiteEditing/${Crypter.sha512(firebaseApp.auth.currentUser!.uid)}`, {
            state: 'authenticated',
            firstName: testUser.firstName,
            lastName: testUser.lastName
        });
    });

    afterEach(async() => {
        const result = await firebaseApp.functions.call<DeleteAllDataFunction>('deleteAllData', {});
        expectResult(result).success;
        await firebaseApp.auth.signOut();
    });

    it('remove event not existing', async() => {
        const result = await firebaseApp.functions.call<EventEditFunction>('eventEdit', {
            editType: 'remove',
            groupId: 'general',
            eventId: Guid.newGuid().guidString,
            event: undefined
        });
        expectResult(result).success;
    });

    it('remove event existing', async() => {
        const eventId = Guid.newGuid();
        await firebaseApp.database.setEncrypted<Omit<Event.Flatten, 'id'>>(`events/general/${eventId.guidString}`, {
            date: new Date().toISOString(),
            title: 'title'
        });
        const result = await firebaseApp.functions.call<EventEditFunction>('eventEdit', {
            editType: 'remove',
            groupId: 'general',
            eventId: eventId.guidString,
            event: undefined
        });
        expectResult(result).success;
        expect(await firebaseApp.database.exists(`events/general/${eventId.guidString}`)).to.be.equal(false);
    });

    it('add event not given over', async() => {
        const result = await firebaseApp.functions.call<EventEditFunction>('eventEdit', {
            editType: 'add',
            groupId: 'general',
            eventId: Guid.newGuid().guidString,
            event: undefined
        });
        expectResult(result).failure.to.be.deep.equal({
            code: 'invalid-argument',
            message: 'No event in parameters to add / change.'
        });
    });

    it('add event not existing', async() => {
        const eventId = Guid.newGuid();
        const date = new Date();
        const result = await firebaseApp.functions.call<EventEditFunction>('eventEdit', {
            editType: 'add',
            groupId: 'general',
            eventId: eventId.guidString,
            event: {
                date: date.toISOString(),
                title: 'title'
            }
        });
        expectResult(result).success;
        expect(await firebaseApp.database.getDecrypted<Omit<Event.Flatten, 'id'>>(`events/general/${eventId.guidString}`)).to.be.deep.equal({
            date: date.toISOString(),
            title: 'title'
        });
    });

    it('add event existing', async() => {
        const eventId = Guid.newGuid();
        const date1 = new Date();
        await firebaseApp.database.setEncrypted<Omit<Event.Flatten, 'id'>>(`events/general/${eventId.guidString}`, {
            date: date1.toISOString(),
            title: 'title-1'
        });
        const date2 = new Date(date1.getTime() + 60000);
        const result = await firebaseApp.functions.call<EventEditFunction>('eventEdit', {
            editType: 'add',
            groupId: 'general',
            eventId: eventId.guidString,
            event: {
                date: date2.toISOString(),
                title: 'title-2'
            }
        });
        expectResult(result).failure.to.be.deep.equal({
            code: 'invalid-argument',
            message: 'Couldn\'t add existing event.'
        });
    });

    it('change event not given over', async() => {
        const result = await firebaseApp.functions.call<EventEditFunction>('eventEdit', {
            editType: 'change',
            groupId: 'general',
            eventId: Guid.newGuid().guidString,
            event: undefined
        });
        expectResult(result).failure.to.be.deep.equal({
            code: 'invalid-argument',
            message: 'No event in parameters to add / change.'
        });
    });

    it('change event not existing', async() => {
        const result = await firebaseApp.functions.call<EventEditFunction>('eventEdit', {
            editType: 'change',
            groupId: 'general',
            eventId: Guid.newGuid().guidString,
            event: {
                date: new Date().toISOString(),
                title: 'title'
            }
        });
        expectResult(result).failure.to.be.deep.equal({
            code: 'invalid-argument',
            message: 'Couldn\'t change not existing event.'
        });
    });

    it('change event existing', async() => {
        const eventId = Guid.newGuid();
        const date1 = new Date();
        await firebaseApp.database.setEncrypted<Omit<Event.Flatten, 'id'>>(`events/general/${eventId.guidString}`, {
            date: date1.toISOString(),
            title: 'title-1'
        });
        const date2 = new Date(date1.getTime() + 60000);
        const result = await firebaseApp.functions.call<EventEditFunction>('eventEdit', {
            editType: 'change',
            groupId: 'general',
            eventId: eventId.guidString,
            event: {
                date: date2.toISOString(),
                title: 'title-2'
            }
        });
        expectResult(result).success;
        expect(await firebaseApp.database.getDecrypted<Omit<Event.Flatten, 'id'>>(`events/general/${eventId.guidString}`)).to.be.deep.equal({
            date: date2.toISOString(),
            title: 'title-2'
        });
    });
});
