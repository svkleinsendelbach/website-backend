import { Guid } from "../src/types/Guid";
import { UtcDate } from "../src/types/UtcDate";
import { authenticateTestUser, cleanUpFirebase, firebaseApp } from "./firebaseApp";

describe('reportGet', () => {
    beforeEach(async () => {
        await authenticateTestUser();
    });
    
    afterEach(async () => {
        await cleanUpFirebase();
    });

    it('get reports', async () => {
        const date1 = UtcDate.now.advanced({ minute: 50 });
        const reportId1 = Guid.newGuid();
        await firebaseApp.database.child('reports').child('dancing').child(reportId1.guidString).set({
            createDate: date1.encoded,
            title: 'report-1',
            message: 'message-1'
        }, 'encrypt');
        const date2 = UtcDate.now.advanced({ minute: 30 });
        const reportId2 = Guid.newGuid();
        await firebaseApp.database.child('reports').child('general').child(reportId2.guidString).set({
            createDate: date2.encoded,
            title: 'report-2',
            message: 'message-2'
        }, 'encrypt');
        const date3 = UtcDate.now.advanced({ minute: 20 });
        const reportId3 = Guid.newGuid();
        const result1 = await firebaseApp.functions.function('report').function('edit').call({
            editType: 'add',
            groupId: 'general',
            previousGroupId: 'general',
            reportId: reportId3.guidString,
            report: {
                createDate: date3.encoded,
                title: 'report-3',
                message: 'message-3'
            }
        });
        result1.success;
        const result2 = await firebaseApp.functions.function('report').function('edit').call({
            editType: 'change',
            groupId: 'dancing',
            previousGroupId: 'dancing',
            reportId: reportId1.guidString,
            report: {
                createDate: date1.encoded,
                title: 'report-1',
                message: 'message-1'
            }
        });
        result2.success;
        const result3 = await firebaseApp.functions.function('report').function('edit').call({
            editType: 'remove',
            groupId: 'general',
            previousGroupId: 'general',
            reportId: reportId2.guidString,
            report: undefined
        });
        result3.success;
        const result = await firebaseApp.functions.function('report').function('getChanges').call({
            groupIds: ['dancing', 'general'],
            upToDate: UtcDate.now.advanced({ day: -1 }).encoded
        });
        result.success.equal([
            {
                groupId: 'dancing',
                reports: [
                    {
                        id: reportId1.guidString,
                        createDate: date1.encoded,
                        title: 'report-1',
                        message: 'message-1'
                    }
                ]
            },
            {
                groupId: 'general',
                reports: [
                    {
                        id: reportId3.guidString,
                        createDate: date3.encoded,
                        title: 'report-3',
                        message: 'message-3'
                    },
                    {
                        id: reportId2.guidString,
                        state: 'deleted'
                    }
                ]
            }
        ]);
    });
});