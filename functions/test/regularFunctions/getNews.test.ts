import { News } from '../../src/classes/News';
import { Crypter } from '../../src/crypter/Crypter';
import { cryptionKeys } from '../privateKeys';
import { callFunction, expectSuccess, setDatabaseValue } from '../utils';

describe('get news', () => {
    afterEach(async () => {
        const result = await callFunction('v2_deleteAllData', {});
        expectSuccess(result).to.be.equal(undefined);
    });

    async function addNews(number: number, disabled: boolean): Promise<News.ReturnType> {
        const crypter = new Crypter(cryptionKeys);
        const news = {
            title: `title${number}`,
            subtitle: `subtitle${number}`,
            date: new Date(new Date().getTime() + number * 100000).toISOString(),
            shortDescription: `shortDescription${number}`,
            newsUrl: `newsUrl${number}`,
            disabled: disabled,
            thumbnailUrl: `tumbnailUrl${number}`
        };
        await setDatabaseValue(`news/news_id_${number}`, crypter.encodeEncrypt(news));       
        return {
            id: `news_id_${number}`,
            ...news
        };
    }

    it('get news', async () => {
        const news3 = await addNews(3, false);
        const news4 = await addNews(4, false);
        await addNews(5, true);
        const news1 = await addNews(1, false);
        await addNews(2, true);
        const result1 = await callFunction('v2_getNews', {});
        expectSuccess(result1).to.be.deep.equal({
            hasMore: false,
            news: [news4, news3, news1]
        });
        const result2 = await callFunction('v2_getNews', {
            numberNews: 5
        });
        expectSuccess(result2).to.be.deep.equal({
            hasMore: false,
            news: [news4, news3, news1]
        });
        const result3 = await callFunction('v2_getNews', {
            numberNews: 3
        });
        expectSuccess(result3).to.be.deep.equal({
            hasMore: false,
            news: [news4, news3, news1]
        });
        const result4 = await callFunction('v2_getNews', {
            numberNews: 1
        });
        expectSuccess(result4).to.be.deep.equal({
            hasMore: true,
            news: [news4]
        });
    });
});
