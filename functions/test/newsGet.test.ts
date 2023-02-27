import { FirebaseApp, expectResult } from 'firebase-function/lib/src/testUtils';
import { type DeleteAllDataFunction } from '../src/functions/DeleteAllDataFunction';
import { type NewsGetFunction } from '../src/functions/NewsGetFunction';
import { type News } from '../src/types/News';
import { cryptionKeys, callSecretKey, firebaseConfig } from './privateKeys';

describe('newsGet', () => {
    const firebaseApp = new FirebaseApp(firebaseConfig, cryptionKeys, callSecretKey, {
        functionsRegion: 'europe-west1',
        databaseUrl: firebaseConfig.databaseURL
    });

    afterEach(async() => {
        const result = await firebaseApp.functions.call<DeleteAllDataFunction>('deleteAllData', {});
        expectResult(result).success;
    });

    async function addNews(number: number, disabled: boolean): Promise<News.Flatten> {
        const news: Omit<News.Flatten, 'id'> = {
            title: `title-${number}`,
            subtitle: `subtitle-${number}`,
            date: new Date(new Date().getTime() + number * 100000).toISOString(),
            shortDescription: `shortDescription-${number}`,
            newsUrl: `newsUrl-${number}`,
            disabled: disabled,
            thumbnailUrl: `tumbnailUrl-${number}`
        };
        await firebaseApp.database.setEncrypted(`news/news_id_${number}`, news);
        return {
            id: `news_id_${number}`,
            ...news
        };
    }

    it('get news', async() => {
        const news3 = await addNews(3, false);
        const news4 = await addNews(4, false);
        const news5 = await addNews(5, true);
        const news1 = await addNews(1, false);
        const news2 = await addNews(2, true);
        const result1 = await firebaseApp.functions.call<NewsGetFunction>('newsGet', {
            numberNews: undefined,
            alsoDisabled: false
        });
        expectResult(result1).success.to.be.deep.equal({
            hasMore: false,
            news: [news4, news3, news1]
        });
        const result2 = await firebaseApp.functions.call<NewsGetFunction>('newsGet', {
            numberNews: undefined,
            alsoDisabled: true
        });
        expectResult(result2).success.to.be.deep.equal({
            hasMore: false,
            news: [news5, news4, news3, news2, news1]
        });
        const result3 = await firebaseApp.functions.call<NewsGetFunction>('newsGet', {
            numberNews: 5,
            alsoDisabled: false
        });
        expectResult(result3).success.to.be.deep.equal({
            hasMore: false,
            news: [news4, news3, news1]
        });
        const result4 = await firebaseApp.functions.call<NewsGetFunction>('newsGet', {
            numberNews: 5,
            alsoDisabled: true
        });
        expectResult(result4).success.to.be.deep.equal({
            hasMore: false,
            news: [news5, news4, news3, news2, news1]
        });
        const result5 = await firebaseApp.functions.call<NewsGetFunction>('newsGet', {
            numberNews: 3,
            alsoDisabled: false
        });
        expectResult(result5).success.to.be.deep.equal({
            hasMore: false,
            news: [news4, news3, news1]
        });
        const result6 = await firebaseApp.functions.call<NewsGetFunction>('newsGet', {
            numberNews: 3,
            alsoDisabled: true
        });
        expectResult(result6).success.to.be.deep.equal({
            hasMore: true,
            news: [news5, news4, news3]
        });
        const result7 = await firebaseApp.functions.call<NewsGetFunction>('newsGet', {
            numberNews: 1,
            alsoDisabled: false
        });
        expectResult(result7).success.to.be.deep.equal({
            hasMore: true,
            news: [news4]
        });
        const result8 = await firebaseApp.functions.call<NewsGetFunction>('newsGet', {
            numberNews: 1,
            alsoDisabled: true
        });
        expectResult(result8).success.to.be.deep.equal({
            hasMore: true,
            news: [news5]
        });
    });
});
