import { Guid } from 'firebase-function';
import { UtcDate } from 'firebase-function';
import { cleanUpFirebase, firebaseApp } from './firebaseApp';

describe('reportGet', () => {
    afterEach(async () => {
        await cleanUpFirebase();
    });

    it('get reports', async () => {
        const date1 = UtcDate.now.advanced({ minute: -50 });
        const reportId1 = Guid.newGuid();
        await firebaseApp.database.child('reports').child('general').child(reportId1.guidString).set({
            createDate: date1.encoded,
            title: 'report-1',
            message: 'report-message',
            imageUrl: null,
            discordMessageId: null
        }, 'encrypt');
        const date2 = UtcDate.now.advanced({ minute: -30 });
        const reportId2 = Guid.newGuid();
        await firebaseApp.database.child('reports').child('general').child(reportId2.guidString).set({
            createDate: date2.encoded,
            title: 'report-2',
            message: 'report-message',
            imageUrl: null,
            discordMessageId: null
        }, 'encrypt');
        const date3 = UtcDate.now.advanced({ minute: -20 });
        const reportId3 = Guid.newGuid();
        await firebaseApp.database.child('reports').child('football-adults/first-team').child(reportId3.guidString).set({
            createDate: date3.encoded,
            title: 'report-3',
            message: 'report-message',
            imageUrl: null,
            discordMessageId: null
        }, 'encrypt');
        const result = await firebaseApp.functions.function('report').function('get').call({
            groupIds: ['general', 'football-adults/first-team']
        });
        result.success.equal([
            {
                groupId: 'general',
                reports: [
                    {
                        id: reportId1.guidString,
                        createDate: date1.encoded,
                        title: 'report-1',
                        message: 'report-message',
                        imageUrl: null
                    },
                    {
                        id: reportId2.guidString,
                        createDate: date2.encoded,
                        title: 'report-2',
                        message: 'report-message',
                        imageUrl: null
                    }
                ]
            },
            {
                groupId: 'football-adults/first-team',
                reports: [
                    {
                        id: reportId3.guidString,
                        createDate: date3.encoded,
                        title: 'report-3',
                        message: 'report-message',
                        imageUrl: null
                    }
                ]
            }
        ]);
    });
});
