import { type DatabaseType, HttpsError, type Logger } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';

export async function checkPrerequirements(
    parameters: {
        databaseType: DatabaseType;
    },
    logger: Logger,
    auth: AuthData | undefined | 'notRequired'
) {
    logger.log('checkPrerequirements', { parameters: parameters, auth: auth });

    // Check if user is authorized to call a function.
    if (auth === undefined)
        throw HttpsError('permission-denied', 'The function must be called while authenticated, nobody signed in.', logger);
}
