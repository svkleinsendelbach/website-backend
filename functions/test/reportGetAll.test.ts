import { Guid } from '../src/types/Guid';
import { type ReportGroupId, type Report } from '../src/types/Report';
import { UtcDate } from 'firebase-function';
import { cleanUpFirebase, firebaseApp } from './firebaseApp';

describe('reportGetAll', () => {
    afterEach(async () => {
        await cleanUpFirebase();
    });

    async function addReport(number: number, groupId: ReportGroupId): Promise<Report.Flatten & { groupId: ReportGroupId }> {
        const report: Omit<Report.Flatten, 'id'> = {
            title: `title-${number}`,
            message: `message-${number}`,
            createDate: UtcDate.now.advanced({ minute: number * 100 }).encoded,
            imageUrl: null
        };
        const reportId = Guid.newGuid();
        await firebaseApp.database.child('reports').child(groupId).child(reportId.guidString).set(report, 'encrypt');
        return {
            ...report,
            id: reportId.guidString,
            groupId: groupId
        };
    }

    it('get all reports', async () => {
        const report3 = await addReport(3, 'general');
        const report1 = await addReport(1, 'football-adults/first-team/game-report');
        const report2 = await addReport(2, 'football-adults/first-team/game-report');
        const result = await firebaseApp.functions.function('report').function('getAll').call({});
        result.success.equal([report3, report2, report1]);
    });
});
