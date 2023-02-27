import { FirebaseApp, expectResult } from 'firebase-function/lib/src/testUtils';
import { type DeleteAllDataFunction } from '../src/functions/DeleteAllDataFunction';
import { type NewsGetSingleFunction } from '../src/functions/NewsGetSingle';
import { type News } from '../src/types/News';
import { cryptionKeys, callSecretKey, firebaseConfig } from './privateKeys';

describe('newsGetSingle', () => {
    const firebaseApp = new FirebaseApp(firebaseConfig, cryptionKeys, callSecretKey, {
        functionsRegion: 'europe-west1',
        databaseUrl: firebaseConfig.databaseURL
    });

    afterEach(async() => {
        const result = await firebaseApp.functions.call<DeleteAllDataFunction.Parameters, DeleteAllDataFunction.ReturnType>('deleteAllData', {});
        expectResult(result).success;
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
        await firebaseApp.database.setEncrypted('news/news_id', news);
        return {
            id: 'news_id',
            ...news
        };
    }

    it('get news not existing', async() => {
        const result = await firebaseApp.functions.call<NewsGetSingleFunction.Parameters, NewsGetSingleFunction.ReturnType>('newsGetSingle', {
            newsId: 'news_id'
        });
        expectResult(result).failure.to.be.deep.equal({
            code: 'not-found',
            message: 'News with specified id not found.'
        });
    });

    it('get news disabled', async() => {
        await addNews(true);
        const result = await firebaseApp.functions.call<NewsGetSingleFunction.Parameters, NewsGetSingleFunction.ReturnType>('newsGetSingle', {
            newsId: 'news_id'
        });
        expectResult(result).failure.to.be.deep.equal({
            code: 'unavailable',
            message: 'News with specified id is disabled.'
        });
    });

    it('get news', async() => {
        const news = await addNews(false);
        const result = await firebaseApp.functions.call<NewsGetSingleFunction.Parameters, NewsGetSingleFunction.ReturnType>('newsGetSingle', {
            newsId: 'news_id'
        });
        expectResult(result).success.to.be.deep.equal(news);
    });
});
