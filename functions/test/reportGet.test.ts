import { Guid } from '../src/types/Guid';
import { type Report } from '../src/types/Report';
import { cleanUpFirebase, firebaseApp } from './firebaseApp';

describe('reportGet', () => {
    afterEach(async () => {
        await cleanUpFirebase();
    });

    async function addReport(number: number): Promise<Report.Flatten> {
        const report: Omit<Report.Flatten, 'id'> = {
            title: `title-${number}`,
            message: `message-${number}`,
            createDate: new Date(new Date().getTime() + number * 100000).toISOString()
        };
        const reportId = Guid.newGuid();
        await firebaseApp.database.child('reports').child('general').child(reportId.guidString).set(report, 'encrypt');
        return {
            id: reportId.guidString,
            ...report
        };
    }

    it('get report', async () => {
        const report3 = await addReport(3);
        const report1 = await addReport(1);
        const report2 = await addReport(2);
        const result1 = await firebaseApp.functions.function('report').function('get').call({
            groupId: 'general',
            numberReports: undefined
        });
        result1.success.equal({
            hasMore: false,
            reports: [report3, report2, report1]
        });
        const result2 = await firebaseApp.functions.function('report').function('get').call({
            groupId: 'general',
            numberReports: 2
        });
        result2.success.equal({
            hasMore: true,
            reports: [report3, report2]
        });
        const result3 = await firebaseApp.functions.function('report').function('get').call({
            groupId: 'general',
            numberReports: 4
        });
        result3.success.equal({
            hasMore: false,
            reports: [report3, report2, report1]
        });
        const result4 = await firebaseApp.functions.function('report').function('get').call({
            groupId: 'general',
            numberReports: 5
        });
        result4.success.equal({
            hasMore: false,
            reports: [report3, report2, report1]
        });
    });
});
