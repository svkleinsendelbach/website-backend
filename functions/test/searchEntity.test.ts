import { type EventGroupId, type Event } from '../src/types/Event';
import { Guid } from '../src/types/Guid';
import { type News } from '../src/types/News';
import { type ReportGroupId, type Report } from '../src/types/Report';
import { cleanUpFirebase, firebaseApp } from './firebaseApp';

describe('searchEntity', () => {
    afterEach(async () => {
        await cleanUpFirebase();
    });

    async function addEvent(groupId: EventGroupId, title: string, subtitle: string | undefined): Promise<Event.Flatten> {
        const event: Omit<Event.Flatten, 'id'> = {
            date: new Date().toISOString(),
            title: title,
            subtitle: subtitle
        };
        const eventId = Guid.newGuid();
        await firebaseApp.database.child('events').child(groupId).child(eventId.guidString).set(event, 'encrypt');
        return {
            id: eventId.guidString,
            ...event
        };
    }

    async function addNews(title: string, subtitle: string | undefined, shortDescription: string, disabled: boolean): Promise<News.Flatten> {
        const news: Omit<News.Flatten, 'id'> = {
            title: title,
            subtitle: subtitle,
            date: new Date().toISOString(),
            shortDescription: shortDescription,
            newsUrl: '',
            disabled: disabled,
            thumbnailUrl: ''
        };
        const newsId = Guid.newGuid();
        await firebaseApp.database.child('news').child(newsId.guidString).set(news, 'encrypt');
        return {
            id: newsId.guidString,
            ...news
        };
    }

    async function addReport(groupId: ReportGroupId, title: string, message: string): Promise<Report.Flatten> {
        const report: Omit<Report.Flatten, 'id'> = {
            title: title,
            message: message,
            createDate: new Date().toISOString()
        };
        const reportId = Guid.newGuid();
        await firebaseApp.database.child('reports').child(groupId).child(reportId.guidString).set(report, 'encrypt');
        return {
            id: reportId.guidString,
            ...report
        };
    }

    it('search', async () => {
        await addEvent('dancing', 'no search text', undefined);
        await addEvent('football-youth/e-youth', 'no search text', 'no search text');
        const event1 = await addEvent('general', 'ölm find me', undefined);
        const event2 = await addEvent('general', 'ölm find me poü', 'find me');
        const event3 = await addEvent('football-adults/general', 'no search text', 'find me asdf');
        await addNews('no search text', undefined, 'no search text', false);
        await addNews('no search text', 'no search text', 'no search text', false);
        const news1 = await addNews('find me', 'no search text', 'no search text', false);
        const news2 = await addNews('no search text', 'find me', 'no search text', false);
        const news3 = await addNews('no search text', 'no search text', 'find me', false);
        await addNews('find me', 'no search text', 'no search text', true);
        await addReport('general', 'no search text', 'no search text');
        const report1 = await addReport('football-youth/f-youth/game-report', 'find me', 'no search text');
        const report2 = await addReport('football-adults/second-team/game-report', 'no search text', 'find me');
        const result = await firebaseApp.functions.function('searchEntity').call({
            searchEntityTypes: ['events', 'news', 'reports'],
            searchText: 'find me'
        });
        result.success.unsorted([
            { type: 'events', value: event1 },
            { type: 'events', value: event2 },
            { type: 'events', value: event3 },
            { type: 'news', value: news1 },
            { type: 'news', value: news2 },
            { type: 'news', value: news3 },
            { type: 'reports', value: report1 },
            { type: 'reports', value: report2 }
        ]);
    });
});
