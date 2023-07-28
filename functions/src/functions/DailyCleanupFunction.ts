import { DatabaseReference, DatabaseType, FirebaseSchedule } from 'firebase-function';
import { ReportGroupId } from '../types/Report';
import { EventGroupId } from '../types/Event';
import { baseDatabaseReference } from '../utils';
import { UtcDate } from '../types/UtcDate';

export class DailyCleanupFunction implements FirebaseSchedule {
    public async executeFunction() {
        await Promise.all((['release', 'debug'] as DatabaseType.Value[]).map(async databaseType => {
            return await Promise.all([
                ...EventGroupId.all.map(async groupId => this.cleanupChanges(new DatabaseType(databaseType), { type: 'events', groupId: groupId })),
                ...ReportGroupId.all.map(async groupId => this.cleanupChanges(new DatabaseType(databaseType), { type: 'reports', groupId: groupId }))
            ]);
        }));
    }

    private async cleanupChanges(databaseType: DatabaseType, type: { type: 'events'; groupId: EventGroupId } | { type: 'reports'; groupId: ReportGroupId }) {
        let reference: DatabaseReference<{ [Date in string]: Record<string, string> }>;
        if (type.type === 'events')
            reference = baseDatabaseReference(databaseType).child(type.type).child(type.groupId).child('changes');
        else
            reference = baseDatabaseReference(databaseType).child(type.type).child(type.groupId).child('changes');
        const snapshot = await reference.snapshot();
        const currentDate = UtcDate.now.setted({ hour: 0, minute: 0 });
        await Promise.all(snapshot.map(async snapshot => {
            const date = UtcDate.decode(snapshot.key!);
            if (date.compare(currentDate.advanced({ day: -4 })) === 'less')
                await reference.child(snapshot.key!).remove();
        }));
    }
}
