import { expect } from 'chai';
import { Crypter } from '../../src/crypter/Crypter';
import { cryptionKeys } from '../privateKeys';
import { signInTestUser, getCurrentUser, setDatabaseValue, callFunction, expectSuccess, signOutUser, existsDatabaseValue, expectFailed, getDecryptedDatabaseValue } from '../utils';

describe('edit news', () => {
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

    it('Remove not existing news', async () => {
        const result = await callFunction('v2_editNews', {
            editType: 'remove',
            id: 'news_id',
            news: undefined
        });
        expectSuccess(result).to.be.equal('news_id');
    });
    
    it('Remove existing news', async () => {
        await setDatabaseValue('news/news_id', {
            date: new Date().toISOString(),
            title: 'title'
        });
        expect(await existsDatabaseValue('news/news_id')).to.be.true;
        const result = await callFunction('v2_editNews', {
            editType: 'remove',
            id: 'news_id',
            news: undefined
        });
        expectSuccess(result).to.be.equal('news_id');
        expect(await existsDatabaseValue('news/news_id')).to.be.false;
    });
    
    it('Add news not given over', async () => {
        const result = await callFunction('v2_editNews', {
            editType: 'add',
            id: 'news_id',
            news: undefined
        });
        expectFailed(result).value('code').to.be.equal('invalid-argument');
    });
    
    it('Add news not existsting', async () => {
        const date = new Date();
        const result = await callFunction('v2_editNews', {
            editType: 'add',
            id: 'news_id',
            news: {
                date: date.toISOString(),
                title: 'title',
                newsUrl: 'newsUrls',
                disabled: true,
                thumbnailUrl: 'thumbnailUrl'
            }
        });
        expectSuccess(result).to.be.equal('news_id');
        const databaseValue = await getDecryptedDatabaseValue('news/news_id');
        expect(databaseValue).to.be.deep.equal({
            date: date.toISOString(),
            title: 'title',
            newsUrl: 'newsUrls',
            disabled: true,
            thumbnailUrl: 'thumbnailUrl'
        });
    });
    
    it('Add news existsting', async () => {
        await setDatabaseValue('news/news_id', {
            date: new Date().toISOString(),
            title: 'title',
            newsUrl: 'newsUrls',
            disabled: true,
            thumbnailUrl: 'thumbnailUrl'
        });
        await setDatabaseValue('news/news_id_2', {
            date: new Date().toISOString(),
            title: 'title',
            newsUrl: 'newsUrls',
            disabled: true,
            thumbnailUrl: 'thumbnailUrl'
        });
        await setDatabaseValue('news/news_id_4', {
            date: new Date().toISOString(),
            title: 'title',
            newsUrl: 'newsUrls',
            disabled: true,
            thumbnailUrl: 'thumbnailUrl'
        });
        const date = new Date();
        const result = await callFunction('v2_editNews', {
            editType: 'add',
            id: 'news_id',
            news: {
                date: date.toISOString(),
                title: 'title2',
                newsUrl: 'newsUrls2',
                disabled: false,
                thumbnailUrl: 'thumbnailUrl2'
            }
        });
        expectSuccess(result).to.be.equal('news_id_3');
        const databaseValue = await getDecryptedDatabaseValue('news/news_id_3');
        expect(databaseValue).to.be.deep.equal({
            date: date.toISOString(),
            title: 'title2',
            newsUrl: 'newsUrls2',
            disabled: false,
            thumbnailUrl: 'thumbnailUrl2'
        });
    });

    it('Change news not given over', async () => {
        const result = await callFunction('v2_editNews', {
            editType: 'change',
            id: 'news_id',
            news: undefined
        });
        expectFailed(result).value('code').to.be.equal('invalid-argument');
    });
    
    it('Change news not existsting', async () => {
        const date = new Date();
        const result = await callFunction('v2_editNews', {
            editType: 'change',
            id: 'news_id',
            news: {
                date: date.toISOString(),
                title: 'title',
                newsUrl: 'newsUrls',
                disabled: true,
                thumbnailUrl: 'thumbnailUrl'
            }
        });
        expectFailed(result).value('code').to.be.equal('invalid-argument');
    });
    
    it('Change news existsting', async () => {
        await setDatabaseValue('news/news_id', {
            date: new Date().toISOString(),
            title: 'title',
            newsUrl: 'newsUrls',
            disabled: true,
            thumbnailUrl: 'thumbnailUrl'
        });
        const date = new Date();
        const result = await callFunction('v2_editNews', {
            editType: 'change',
            id: 'news_id',
            news: {
                date: date.toISOString(),
                title: 'title2',
                newsUrl: 'newsUrls2',
                disabled: false,
                thumbnailUrl: 'thumbnailUrl2'
            }
        });
        expectSuccess(result).to.be.equal('news_id');
        const databaseValue = await getDecryptedDatabaseValue('news/news_id');
        expect(databaseValue).to.be.deep.equal({
            date: date.toISOString(),
            title: 'title2',
            newsUrl: 'newsUrls2',
            disabled: false,
            thumbnailUrl: 'thumbnailUrl2'
        });
    });
});
