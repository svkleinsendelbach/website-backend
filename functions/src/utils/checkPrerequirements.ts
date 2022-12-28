import { AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { functionCallKey } from '../privateKeys';
import { DatabaseType } from './DatabaseType';
import { Logger } from './Logger';
import { httpsError } from './utils';

export async function checkPrerequirements(
    parameters: {
        databaseType: DatabaseType,
        privateKey: string,
    },
    logger: Logger,
    auth?: AuthData | 'notRequired'
) {
    logger.append('checkPrerequirements', { parameters, auth });

    // Check if private key is valid.
    if (parameters.privateKey !== functionCallKey(parameters.databaseType))
        throw httpsError('permission-denied', 'Private key is invalid.', logger);

    // Check if user is authorized to call a function.
    if (auth === undefined)
        throw httpsError('permission-denied', 'The function must be called while authenticated, nobody signed in.', logger);
}
