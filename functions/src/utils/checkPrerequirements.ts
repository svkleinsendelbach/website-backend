import { AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { DatabaseType } from './DatabaseType';
import { checkFiatShamir, FiatShamirParameters } from './fiatShamir';
import { Logger } from './Logger';
import { httpsError } from './utils';

export async function checkPrerequirements(
    parameters: {
        databaseType: DatabaseType,
        fiatShamirParameters: FiatShamirParameters,
    },
    logger: Logger,
    auth?: AuthData | 'notRequired'
) {
    logger.append('checkPrerequirements', { parameters, auth });

    // Check fiat shamir
    checkFiatShamir(parameters.fiatShamirParameters, parameters.databaseType, logger.nextIndent);

    // Check if user is authorized to call a function.
    if (auth === undefined)
        throw httpsError('permission-denied', 'The function must be called while authenticated, nobody signed in.', logger);
}
