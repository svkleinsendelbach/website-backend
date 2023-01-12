import * as functions from 'firebase-functions';
import { DatabaseType } from '../classes/DatabaseType';
import { FirebaseDatabase } from '../utils/FirebaseDatabase';
import { FirebaseFunction } from '../utils/FirebaseFunction';
import { Logger } from '../utils/Logger';

export class DailyCleanupFunction implements FirebaseFunction<undefined, void> {

    public parameters = undefined;

    private logger: Logger;

    public constructor(context: functions.EventContext<Record<string, string>>) {
        this.logger = Logger.start('none', 'DailyCleanupFunction.constructor', { context }, 'notice');
    }

    public async executeFunction(): Promise<void> {
        this.logger.log('DailyCleanupFunction.executeFunction', {}, 'info');
        await Promise.all([
            this.deleteAllFiatShamirChallenges(new DatabaseType('release')),
            this.deleteAllFiatShamirChallenges(new DatabaseType('debug'))
        ]);
    }

    private async deleteAllFiatShamirChallenges(databaseType: DatabaseType) {
        const reference = FirebaseDatabase.Reference.fromPath('fiatShamir', databaseType);
        const snapshot = await reference.snapshot();
        if (snapshot.exists) 
            await reference.remove();
    }
}
