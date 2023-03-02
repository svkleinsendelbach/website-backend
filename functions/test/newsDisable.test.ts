import { expect } from 'firebase-function/lib/src/testUtils';
import { type News } from '../src/types/News';
import { authenticateTestUser, cleanUpFirebase, firebaseApp } from './firebaseApp';

describe('newsDisable', () => {
    beforeEach(async() => {
        await authenticateTestUser();
    });

    afterEach(async() => {
        await cleanUpFirebase();
    });

    it('disable news not existing', async() => {
        const result = await firebaseApp.functions.function('news').function('disable').call({
            editType: 'disable',
            newsId: 'news_id'
        });
        result.failure.equal({
            code: 'not-found',
            message: 'Couldn\'t find news with specified id.'
        });
    });

    it('disable news', async() => {
        const news: Omit<News.Flatten, 'id'> = {
            date: new Date().toISOString(),
            title: 'title',
            newsUrl: 'newsUrl',
            disabled: false,
            thumbnailUrl: 'thumbnailUrl'
        };
        await firebaseApp.database.child('news').child('news_id').set(news, true);
        const result = await firebaseApp.functions.function('news').function('disable').call({
            editType: 'disable',
            newsId: 'news_id'
        });
        result.success;
        expect(await firebaseApp.database.child('news').child('news_id').get(true)).to.be.deep.equal({
            ...news,
            disabled: true
        });
    });

    it('enable news', async() => {
        const news: Omit<News.Flatten, 'id'> = {
            date: new Date().toISOString(),
            title: 'title',
            newsUrl: 'newsUrl',
            disabled: true,
            thumbnailUrl: 'thumbnailUrl'
        };
        await firebaseApp.database.child('news').child('news_id').set(news, true);
        const result = await firebaseApp.functions.function('news').function('disable').call({
            editType: 'enable',
            newsId: 'news_id'
        });
        result.success;
        expect(await firebaseApp.database.child('news').child('news_id').get(true)).to.be.deep.equal({
            ...news,
            disabled: false
        });
    });
});
