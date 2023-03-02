import { type News } from '../src/types/News';
import { cleanUpFirebase, firebaseApp } from './firebaseApp';

describe('newsGet', () => {
    afterEach(async() => {
        await cleanUpFirebase();
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
        await firebaseApp.database.child('news').child(`news_id_${number}`).set(news, true);
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
        const result1 = await firebaseApp.functions.function('news').function('get').call({
            numberNews: undefined,
            alsoDisabled: false
        });
        result1.success.equal({
            hasMore: false,
            news: [news4, news3, news1]
        });
        const result2 = await firebaseApp.functions.function('news').function('get').call({
            numberNews: undefined,
            alsoDisabled: true
        });
        result2.success.equal({
            hasMore: false,
            news: [news5, news4, news3, news2, news1]
        });
        const result3 = await firebaseApp.functions.function('news').function('get').call({
            numberNews: 5,
            alsoDisabled: false
        });
        result3.success.equal({
            hasMore: false,
            news: [news4, news3, news1]
        });
        const result4 = await firebaseApp.functions.function('news').function('get').call({
            numberNews: 5,
            alsoDisabled: true
        });
        result4.success.equal({
            hasMore: false,
            news: [news5, news4, news3, news2, news1]
        });
        const result5 = await firebaseApp.functions.function('news').function('get').call({
            numberNews: 3,
            alsoDisabled: false
        });
        result5.success.equal({
            hasMore: false,
            news: [news4, news3, news1]
        });
        const result6 = await firebaseApp.functions.function('news').function('get').call({
            numberNews: 3,
            alsoDisabled: true
        });
        result6.success.equal({
            hasMore: true,
            news: [news5, news4, news3]
        });
        const result7 = await firebaseApp.functions.function('news').function('get').call({
            numberNews: 1,
            alsoDisabled: false
        });
        result7.success.equal({
            hasMore: true,
            news: [news4]
        });
        const result8 = await firebaseApp.functions.function('news').function('get').call({
            numberNews: 1,
            alsoDisabled: true
        });
        result8.success.equal({
            hasMore: true,
            news: [news5]
        });
    });
});
