import { expect } from 'firebase-function/lib/src/testUtils';
import { authenticateTestUser, cleanUpFirebase, firebaseApp } from './firebaseApp';

describe('newsEdit', () => {
    beforeEach(async () => {
        await authenticateTestUser();
    });

    afterEach(async () => {
        await cleanUpFirebase();
    });

    it('remove news not existing', async () => {
        const result = await firebaseApp.functions.function('news').function('edit').call({
            editType: 'remove',
            newsId: 'news_id',
            news: undefined
        });
        result.success.equal('news_id');
    });

    it('remove news existing', async () => {
        await firebaseApp.database.child('news').child('news_id').set({
            date: new Date().toISOString(),
            title: 'title',
            newsUrl: 'newsUrl',
            disabled: false,
            thumbnailUrl: 'thumbnailUrl'
        }, true);
        const result = await firebaseApp.functions.function('news').function('edit').call({
            editType: 'remove',
            newsId: 'news_id',
            news: undefined
        });
        result.success.equal('news_id');
        expect(await firebaseApp.database.child('news').child('news_id').exists()).to.be.equal(false);
    });

    it('add news not given over', async () => {
        const result = await firebaseApp.functions.function('news').function('edit').call({
            editType: 'add',
            newsId: 'news_id',
            news: undefined
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'No news in parameters to add / change.'
        });
    });

    it('add news not existing', async () => {
        const date = new Date();
        const result = await firebaseApp.functions.function('news').function('edit').call({
            editType: 'add',
            newsId: 'news_id',
            news: {
                date: date.toISOString(),
                title: 'title',
                newsUrl: 'newsUrl',
                disabled: false,
                thumbnailUrl: 'thumbnailUrl'
            }
        });
        result.success.equal('news_id');
        expect(await firebaseApp.database.child('news').child('news_id').get(true)).to.be.deep.equal({
            date: date.toISOString(),
            title: 'title',
            newsUrl: 'newsUrl',
            disabled: false,
            thumbnailUrl: 'thumbnailUrl'
        });
    });

    it('add news existing', async () => {
        const date1 = new Date();
        await firebaseApp.database.child('news').child('news_id').set({
            date: date1.toISOString(),
            title: 'title-1',
            newsUrl: 'newsUrl-1',
            disabled: true,
            thumbnailUrl: 'thumbnailUrl-1'
        }, true);
        const date2 = new Date(date1.getTime() + 30000);
        await firebaseApp.database.child('news').child('news_id_2').set({
            date: date2.toISOString(),
            title: 'title-2',
            newsUrl: 'newsUrl-2',
            disabled: true,
            thumbnailUrl: 'thumbnailUrl-2'
        }, true);
        const date4 = new Date(date1.getTime() + 90000);
        await firebaseApp.database.child('news').child('news_id_4').set({
            date: date4.toISOString(),
            title: 'title-4',
            newsUrl: 'newsUrl-4',
            disabled: true,
            thumbnailUrl: 'thumbnailUrl-4'
        }, true);
        const date3 = new Date(date1.getTime() + 60000);
        const result = await firebaseApp.functions.function('news').function('edit').call({
            editType: 'add',
            newsId: 'news_id',
            news: {
                date: date3.toISOString(),
                title: 'title-3',
                newsUrl: 'newsUrl-3',
                disabled: false,
                thumbnailUrl: 'thumbnailUrl-3'
            }
        });
        result.success.equal('news_id_3');
        expect(await firebaseApp.database.child('news').child('news_id').get(true)).to.be.deep.equal({
            date: date1.toISOString(),
            title: 'title-1',
            newsUrl: 'newsUrl-1',
            disabled: true,
            thumbnailUrl: 'thumbnailUrl-1'
        });
        expect(await firebaseApp.database.child('news').child('news_id_3').get(true)).to.be.deep.equal({
            date: date3.toISOString(),
            title: 'title-3',
            newsUrl: 'newsUrl-3',
            disabled: false,
            thumbnailUrl: 'thumbnailUrl-3'
        });
    });

    it('change news not given over', async () => {
        const result = await firebaseApp.functions.function('news').function('edit').call({
            editType: 'change',
            newsId: 'news_id',
            news: undefined
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'No news in parameters to add / change.'
        });
    });

    it('change news not existing', async () => {
        const result = await firebaseApp.functions.function('news').function('edit').call({
            editType: 'change',
            newsId: 'news_id',
            news: {
                date: new Date().toISOString(),
                title: 'title',
                newsUrl: 'newsUrl',
                disabled: false,
                thumbnailUrl: 'thumbnailUrl'
            }
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'Couldn\'t change not existing news.'
        });
    });

    it('change news existsting', async () => {
        await firebaseApp.database.child('news').child('news_id').set({
            date: new Date().toISOString(),
            title: 'title',
            newsUrl: 'newsUrls',
            disabled: true,
            thumbnailUrl: 'thumbnailUrl'
        }, true);
        const date = new Date();
        const result = await firebaseApp.functions.function('news').function('edit').call({
            editType: 'change',
            newsId: 'news_id',
            news: {
                date: date.toISOString(),
                title: 'title2',
                newsUrl: 'newsUrls2',
                disabled: false,
                thumbnailUrl: 'thumbnailUrl2'
            }
        });
        result.success.equal('news_id');
        expect(await firebaseApp.database.child('news').child('news_id').get(true)).to.be.deep.equal({
            date: date.toISOString(),
            title: 'title2',
            newsUrl: 'newsUrls2',
            disabled: false,
            thumbnailUrl: 'thumbnailUrl2'
        });
    });
});
