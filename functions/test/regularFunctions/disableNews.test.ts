import { expect } from 'chai';
import { Crypter } from '../../src/crypter/Crypter';
import { cryptionKeys } from '../privateKeys';
import { signInTestUser, getCurrentUser, setDatabaseValue, setEncryptedDatabaseValue, callFunction, expectSuccess, signOutUser, expectFailed, getDecryptedDatabaseValue } from '../utils';

describe('disable news', () => {
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
        const result = await callFunction('deleteAllData', {});
        expectSuccess(result).to.be.equal(undefined);
        await signOutUser();
    });

    it('Disable not existing news', async () => {
        const result = await callFunction('disableNews', {
            editType: 'disable',
            id: 'news_id'
        });
        expectFailed(result).value('code').to.be.equal('not-found');
    });

    it('Disable news', async () => {
        const date = new Date();
        await setEncryptedDatabaseValue('news/news_id', {
            date: date.toISOString(),
            title: 'title',
            newsUrl: 'newsUrl',
            disabled: false,
            thumbnailUrl: 'thumbnailUrl'
        });
        const result = await callFunction('disableNews', {
            editType: 'disable',
            id: 'news_id'
        });
        expectSuccess(result).to.be.equal(undefined);
        const databaseValue = await getDecryptedDatabaseValue('news/news_id');
        expect(databaseValue).to.be.deep.equal({
            date: date.toISOString(),
            title: 'title',
            newsUrl: 'newsUrl',
            disabled: true,
            thumbnailUrl: 'thumbnailUrl'
        });
    });

    it('Enable news', async () => {
        const date = new Date();
        await setEncryptedDatabaseValue('news/news_id', {
            date: date.toISOString(),
            title: 'title',
            newsUrl: 'newsUrl',
            disabled: true,
            thumbnailUrl: 'thumbnailUrl'
        });
        const result = await callFunction('disableNews', {
            editType: 'enable',
            id: 'news_id'
        });
        expectSuccess(result).to.be.equal(undefined);
        const databaseValue = await getDecryptedDatabaseValue('news/news_id');
        expect(databaseValue).to.be.deep.equal({
            date: date.toISOString(),
            title: 'title',
            newsUrl: 'newsUrl',
            disabled: false,
            thumbnailUrl: 'thumbnailUrl'
        });
    });
});
