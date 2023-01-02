import { expect } from 'chai';
import { guid } from '../../src/classes/guid';
import { Crypter } from '../../src/crypter/Crypter';
import { cryptionKeys } from '../privateKeys';
import { signInTestUser, getCurrentUser, setDatabaseValue, callFunction, expectSuccess, signOutUser, existsDatabaseValue, expectFailed, getDatabaseValue } from '../utils';

describe('edit event', () => {
    beforeEach(async () => {
        await signInTestUser();
        const crypter = new Crypter(cryptionKeys);
        const hashedUserId = Crypter.sha512(getCurrentUser()!.uid);
        await setDatabaseValue(`users/authentication/websiteEditing/${hashedUserId}`, crypter.encodeEncrypt({
            state: 'authenticated',
            firstName: 'test',
            lastName: 'user'
        }));
    });

    afterEach(async () => {
        const result = await callFunction('v2_deleteAllData', {});
        expectSuccess(result).to.be.equal(undefined);
        await signOutUser();
    });

    it('Remove not existing event', async () => {
        const eventId = guid.newGuid();
        const result = await callFunction('v2_editEvent', {
            editType: 'remove',
            groupId: 'general',
            eventId: eventId.guidString,
            event: undefined
        });
        expectSuccess(result).to.be.equal(undefined);
    });
    
    it('Remove existing event', async () => {
        const eventId = guid.newGuid();
        await setDatabaseValue(`events/general/${eventId.guidString}`, {
            date: new Date().toISOString(),
            title: 'title'
        });
        expect(await existsDatabaseValue(`events/general/${eventId.guidString}`)).to.be.true;
        const result = await callFunction('v2_editEvent', {
            editType: 'remove',
            groupId: 'general',
            eventId: eventId.guidString,
            event: undefined
        });
        expectSuccess(result).to.be.equal(undefined);
        expect(await existsDatabaseValue(`events/general/${eventId.guidString}`)).to.be.false;
    });
    
    it('Add event not given over', async () => {
        const eventId = guid.newGuid();
        const result = await callFunction('v2_editEvent', {
            editType: 'add',
            groupId: 'general',
            eventId: eventId.guidString,
            event: undefined
        });
        expectFailed(result).value('code').to.be.equal('invalid-argument');
    });
    
    it('Add event not existsting', async () => {
        const eventId = guid.newGuid();
        const date = new Date();
        const result = await callFunction('v2_editEvent', {
            editType: 'add',
            groupId: 'general',
            eventId: eventId.guidString,
            event: {
                date: date.toISOString(),
                title: 'title'
            }
        });
        expectSuccess(result).to.be.equal(undefined);
        const databaseValue = await getDatabaseValue(`events/general/${eventId.guidString}`);
        expect(databaseValue).to.be.deep.equal({
            date: date.toISOString(),
            title: 'title'
        });
    });
    
    it('Add event existsting', async () => {
        const eventId = guid.newGuid();
        await setDatabaseValue(`events/general/${eventId.guidString}`, {
            date: new Date().toISOString(),
            title: 'title'
        });
        const date = new Date();
        const result = await callFunction('v2_editEvent', {
            editType: 'add',
            groupId: 'general',
            eventId: eventId.guidString,
            event: {
                date: date.toISOString(),
                title: 'title'
            }
        });
        expectFailed(result).value('code').to.be.equal('invalid-argument');
    });

    it('Change event not given over', async () => {
        const eventId = guid.newGuid();
        const result = await callFunction('v2_editEvent', {
            editType: 'change',
            groupId: 'general',
            eventId: eventId.guidString,
            event: undefined
        });
        expectFailed(result).value('code').to.be.equal('invalid-argument');
    });
    
    it('Change event not existsting', async () => {
        const eventId = guid.newGuid();
        const date = new Date();
        const result = await callFunction('v2_editEvent', {
            editType: 'change',
            groupId: 'general',
            eventId: eventId.guidString,
            event: {
                date: date.toISOString(),
                title: 'title'
            }
        });
        expectFailed(result).value('code').to.be.equal('invalid-argument');
    });
    
    it('Change event existsting', async () => {
        const eventId = guid.newGuid();
        await setDatabaseValue(`events/general/${eventId.guidString}`, {
            date: new Date().toISOString(),
            title: 'title'
        });
        const date = new Date();
        const result = await callFunction('v2_editEvent', {
            editType: 'change',
            groupId: 'general',
            eventId: eventId.guidString,
            event: {
                date: date.toISOString(),
                title: 'title2'
            }
        });
        expectSuccess(result).to.be.equal(undefined);
        const databaseValue = await getDatabaseValue(`events/general/${eventId.guidString}`);
        expect(databaseValue).to.be.deep.equal({
            date: date.toISOString(),
            title: 'title2'
        });
    });
});
