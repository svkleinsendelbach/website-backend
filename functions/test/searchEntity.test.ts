import { type EventGroupId, type Event } from '../src/types/Event';
import { Guid } from '../src/types/Guid';
import { type ReportGroupId, type Report } from '../src/types/Report';
import { UtcDate } from '../src/types/UtcDate';
import { cleanUpFirebase, firebaseApp } from './firebaseApp';

describe('searchEntity', () => {
    afterEach(async () => {
        await cleanUpFirebase();
    });

    async function addEvent(groupId: EventGroupId, title: string, subtitle: string | undefined): Promise<Event.Flatten> {
        const event: Omit<Event.Flatten, 'id'> = {
            date: UtcDate.now.encoded,
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

    async function addReport(groupId: ReportGroupId, title: string, message: string): Promise<Report.Flatten> {
        const report: Omit<Report.Flatten, 'id'> = {
            title: title,
            message: message,
            createDate: UtcDate.now.encoded
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
        await addReport('general', 'no search text', 'no search text');
        const report1 = await addReport('football-youth/f-youth/game-report', 'find me', 'no search text');
        const report2 = await addReport('football-adults/second-team/game-report', 'no search text', 'find me');
        const result = await firebaseApp.functions.function('searchEntity').call({
            searchEntityTypes: ['events', 'reports'],
            searchText: 'find me'
        });
        result.success.unsorted([
            { type: 'events', value: event1 },
            { type: 'events', value: event2 },
            { type: 'events', value: event3 },
            { type: 'reports', value: report1 },
            { type: 'reports', value: report2 }
        ]);
    });
});
