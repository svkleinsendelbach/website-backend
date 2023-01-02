import { News } from '../../src/classes/News';
import { Crypter } from '../../src/crypter/Crypter';
import { cryptionKeys } from '../privateKeys';
import { callFunction, expectFailed, expectSuccess, setDatabaseValue } from '../utils';

describe('get single news', () => {
    afterEach(async () => {
        const result = await callFunction('v2_deleteAllData', {});
        expectSuccess(result).to.be.equal(undefined);
    });

    async function addNews(disabled: boolean): Promise<News.ReturnType> {
        const crypter = new Crypter(cryptionKeys);
        const news = {
            title: 'title',
            subtitle: 'subtitle',
            date: new Date(new Date().getTime() + 100000).toISOString(),
            shortDescription: 'shortDescription',
            newsUrl: 'newsUrl',
            disabled: disabled,
            thumbnailUrl: 'tumbnailUrl$'
        };
        await setDatabaseValue('news/news_id', crypter.encodeEncrypt(news));       
        return {
            id: 'news_id',
            ...news
        };
    }

    it('get news', async () => {
        const news = await addNews(false);
        const result = await callFunction('v2_getSingleNews', {
            newsId: 'news_id'
        });
        expectSuccess(result).to.be.deep.equal(news);
    });

    it('get disabled news', async () => {
        await addNews(true);
        const result = await callFunction('v2_getSingleNews', {
            newsId: 'news_id'
        });
        expectFailed(result).value('code').to.be.equal('unavailable');
    });

    it('get not existing news', async () => {
        const result = await callFunction('v2_getSingleNews', {
            newsId: 'news_id'
        });
        expectFailed(result).value('code').to.be.equal('not-found');
    });
});
