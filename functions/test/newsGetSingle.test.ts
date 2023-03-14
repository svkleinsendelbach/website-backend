import { type News } from '../src/types/News';
import { cleanUpFirebase, firebaseApp } from './firebaseApp';

describe('newsGetSingle', () => {
    afterEach(async () => {
        await cleanUpFirebase();
    });

    async function addNews(disabled: boolean): Promise<News.Flatten> {
        const news: Omit<News.Flatten, 'id'> = {
            title: 'title',
            subtitle: 'subtitle',
            date: new Date(new Date().getTime() + 100000).toISOString(),
            shortDescription: 'shortDescription',
            newsUrl: 'newsUrl',
            disabled: disabled,
            thumbnailUrl: 'tumbnailUrl'
        };
        await firebaseApp.database.child('news').child('news_id').set(news, 'encrypt');
        return {
            id: 'news_id',
            ...news
        };
    }

    it('get news not existing', async () => {
        const result = await firebaseApp.functions.function('news').function('getSingle').call({
            newsId: 'news_id'
        });
        result.failure.equal({
            code: 'not-found',
            message: 'News with specified id not found.'
        });
    });

    it('get news disabled', async () => {
        await addNews(true);
        const result = await firebaseApp.functions.function('news').function('getSingle').call({
            newsId: 'news_id'
        });
        result.failure.equal({
            code: 'unavailable',
            message: 'News with specified id is disabled.'
        });
    });

    it('get news', async () => {
        const news = await addNews(false);
        const result = await firebaseApp.functions.function('news').function('getSingle').call({
            newsId: 'news_id'
        });
        result.success.equal(news);
    });
});
