import { Crypter } from 'firebase-function';
import { FirebaseApp, expectResult, expect } from 'firebase-function/lib/src/testUtils';
import { type DeleteAllDataFunction } from '../src/functions/DeleteAllDataFunction';
import { type NewsDisableFunction } from '../src/functions/NewsDisableFunction';
import { type News } from '../src/types/News';
import { type UserAuthentication } from '../src/types/UserAuthentication';
import { cryptionKeys, callSecretKey, testUser, firebaseConfig } from './privateKeys';

describe('newsDisable', () => {
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

    it('disable news not existing', async() => {
        const result = await firebaseApp.functions.call<NewsDisableFunction>('newsDisable', {
            editType: 'disable',
            newsId: 'news_id'
        });
        expectResult(result).failure.to.be.deep.equal({
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
        await firebaseApp.database.setEncrypted('news/news_id', news);
        const result = await firebaseApp.functions.call<NewsDisableFunction>('newsDisable', {
            editType: 'disable',
            newsId: 'news_id'
        });
        expectResult(result).success;
        expect(await firebaseApp.database.getDecrypted('news/news_id')).to.be.deep.equal({
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
        await firebaseApp.database.setEncrypted('news/news_id', news);
        const result = await firebaseApp.functions.call<NewsDisableFunction>('newsDisable', {
            editType: 'enable',
            newsId: 'news_id'
        });
        expectResult(result).success;
        expect(await firebaseApp.database.getDecrypted('news/news_id')).to.be.deep.equal({
            ...news,
            disabled: false
        });
    });
});
