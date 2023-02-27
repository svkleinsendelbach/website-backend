import { Crypter } from 'firebase-function';
import { FirebaseApp, expectResult, expect } from 'firebase-function/lib/src/testUtils';
import { type DeleteAllDataFunction } from '../src/functions/DeleteAllDataFunction';
import { type NewsEditFunction } from '../src/functions/NewsEditFunction';
import { type News } from '../src/types/News';
import { type UserAuthentication } from '../src/types/UserAuthentication';
import { cryptionKeys, callSecretKey, testUser, firebaseConfig } from './privateKeys';

describe('newsEdit', () => {
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

    it('remove news not existing', async() => {
        const result = await firebaseApp.functions.call<NewsEditFunction>('newsEdit', {
            editType: 'remove',
            newsId: 'news_id',
            news: undefined
        });
        expectResult(result).success.to.be.equal('news_id');
    });

    it('remove news existing', async() => {
        await firebaseApp.database.setEncrypted<Omit<News.Flatten, 'id'>>('news/news_id', {
            date: new Date().toISOString(),
            title: 'title',
            newsUrl: 'newsUrl',
            disabled: false,
            thumbnailUrl: 'thumbnailUrl'
        });
        const result = await firebaseApp.functions.call<NewsEditFunction>('newsEdit', {
            editType: 'remove',
            newsId: 'news_id',
            news: undefined
        });
        expectResult(result).success.to.be.equal('news_id');
        expect(await firebaseApp.database.exists('news/news_id')).to.be.equal(false);
    });

    it('add news not given over', async() => {
        const result = await firebaseApp.functions.call<NewsEditFunction>('newsEdit', {
            editType: 'add',
            newsId: 'news_id',
            news: undefined
        });
        expectResult(result).failure.to.be.deep.equal({
            code: 'invalid-argument',
            message: 'No news in parameters to add / change.'
        });
    });

    it('add news not existing', async() => {
        const date = new Date();
        const result = await firebaseApp.functions.call<NewsEditFunction>('newsEdit', {
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
        expectResult(result).success.to.be.equal('news_id');
        expect(await firebaseApp.database.getDecrypted('news/news_id')).to.be.deep.equal({
            date: date.toISOString(),
            title: 'title',
            newsUrl: 'newsUrl',
            disabled: false,
            thumbnailUrl: 'thumbnailUrl'
        });
    });

    it('add news existing', async() => {
        const date1 = new Date();
        await firebaseApp.database.setEncrypted<Omit<News.Flatten, 'id'>>('news/news_id', {
            date: date1.toISOString(),
            title: 'title-1',
            newsUrl: 'newsUrl-1',
            disabled: true,
            thumbnailUrl: 'thumbnailUrl-1'
        });
        const date2 = new Date(date1.getTime() + 30000);
        await firebaseApp.database.setEncrypted<Omit<News.Flatten, 'id'>>('news/news_id_2', {
            date: date2.toISOString(),
            title: 'title-2',
            newsUrl: 'newsUrl-2',
            disabled: true,
            thumbnailUrl: 'thumbnailUrl-2'
        });
        const date4 = new Date(date1.getTime() + 90000);
        await firebaseApp.database.setEncrypted<Omit<News.Flatten, 'id'>>('news/news_id_4', {
            date: date4.toISOString(),
            title: 'title-4',
            newsUrl: 'newsUrl-4',
            disabled: true,
            thumbnailUrl: 'thumbnailUrl-4'
        });
        const date3 = new Date(date1.getTime() + 60000);
        const result = await firebaseApp.functions.call<NewsEditFunction>('newsEdit', {
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
        expectResult(result).success.to.be.equal('news_id_3');
        expect(await firebaseApp.database.getDecrypted('news/news_id')).to.be.deep.equal({
            date: date1.toISOString(),
            title: 'title-1',
            newsUrl: 'newsUrl-1',
            disabled: true,
            thumbnailUrl: 'thumbnailUrl-1'
        });
        expect(await firebaseApp.database.getDecrypted('news/news_id_3')).to.be.deep.equal({
            date: date3.toISOString(),
            title: 'title-3',
            newsUrl: 'newsUrl-3',
            disabled: false,
            thumbnailUrl: 'thumbnailUrl-3'
        });
    });

    it('change news not given over', async() => {
        const result = await firebaseApp.functions.call<NewsEditFunction>('newsEdit', {
            editType: 'change',
            newsId: 'news_id',
            news: undefined
        });
        expectResult(result).failure.to.be.deep.equal({
            code: 'invalid-argument',
            message: 'No news in parameters to add / change.'
        });
    });

    it('change news not existing', async() => {
        const result = await firebaseApp.functions.call<NewsEditFunction>('newsEdit', {
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
        expectResult(result).failure.to.be.deep.equal({
            code: 'invalid-argument',
            message: 'Couldn\'t change not existing news.'
        });
    });

    it('change news existsting', async() => {
        await firebaseApp.database.setEncrypted<Omit<News.Flatten, 'id'>>('news/news_id', {
            date: new Date().toISOString(),
            title: 'title',
            newsUrl: 'newsUrls',
            disabled: true,
            thumbnailUrl: 'thumbnailUrl'
        });
        const date = new Date();
        const result = await firebaseApp.functions.call<NewsEditFunction>('newsEdit', {
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
        expectResult(result).success.to.be.equal('news_id');
        expect(await firebaseApp.database.getDecrypted('news/news_id')).to.be.deep.equal({
            date: date.toISOString(),
            title: 'title2',
            newsUrl: 'newsUrls2',
            disabled: false,
            thumbnailUrl: 'thumbnailUrl2'
        });
    });
});
