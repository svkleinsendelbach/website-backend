import * as functions from 'firebase-functions';
import { AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { Crypter } from '../crypter/Crypter';
import { cryptionKeys } from '../privateKeys';
import { DatabaseType } from '../classes/DatabaseType';
import { FirebaseFunction } from './FirebaseFunction';
import { Logger } from './Logger';
import { Result } from './Result';
import { convertToFunctionResultError, httpsError, toResult } from './utils';

export function createFunction<
    FFunction extends FirebaseFunction<any, any>
>(
    createFirebaseFunction: (data: any, auth: AuthData | undefined) => FFunction
): functions.HttpsFunction & functions.Runnable<any> {
    return functions
        .region('europe-west1')
        .https
        .onCall(async (data, context) => {

            // Get database
            const logger = Logger.start('none', 'createFunction', undefined, 'notice');
            if (typeof data.databaseType !== 'string') 
                throw httpsError('invalid-argument', 'Couldn\'t get database type.', logger);
            const databaseType = DatabaseType.fromString(data.databaseType, logger.nextIndent);

            // Get result of function call
            const result = await executeFunction(createFirebaseFunction(data, context.auth));

            // Encrypt result
            const crypter = new Crypter(cryptionKeys(databaseType));
            return crypter.encodeEncrypt(result);
        });
}

export function createSchedule<
    FFunction extends FirebaseFunction<undefined, void>
>(
    schedule: string,
    createFirebaseFunction: (context: functions.EventContext<Record<string, string>>) => FFunction
): functions.CloudFunction<any> {
    return functions
        .region('europe-west1')
        .pubsub
        .schedule(schedule)
        .timeZone('Europe/Berlin')
        .onRun(async context => {
            const firebaseFunction = createFirebaseFunction(context);
            await firebaseFunction.executeFunction();
        });
}

async function executeFunction<
    FFunction extends FirebaseFunction<any, any>
>(firebaseFunction: FFunction): Promise<FirebaseFunction.ResultType<FirebaseFunction.ReturnType<FFunction>>> {
    try {
        return await toResult(firebaseFunction.executeFunction());
    } catch (error: any) {
        return Result.failure<FirebaseFunction.Error>(convertToFunctionResultError(error));
    }
}
