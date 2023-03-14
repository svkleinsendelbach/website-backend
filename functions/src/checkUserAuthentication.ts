import { type DatabaseType, HttpsError, type ILogger, DatabaseReference, Crypter } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { type DatabaseScheme } from './DatabaseScheme';
import { getPrivateKeys } from './privateKeys';
import { type UserAuthenticationType } from './types/UserAuthentication';

export async function checkUserAuthentication(
    auth: AuthData | undefined,
    authenticationTypes: UserAuthenticationType | UserAuthenticationType[],
    databaseType: DatabaseType,
    logger: ILogger
) {
    logger.log('checkUserAuthentication', { auth: auth, authenticationTypes: authenticationTypes, databaseType: databaseType });
    if (auth === undefined)
        throw HttpsError('permission-denied', 'The function must be called while authenticated, nobody signed in.', logger);
    if (typeof authenticationTypes === 'string') {
        await checkSingleUserAuthenticationType(auth, authenticationTypes, databaseType, logger.nextIndent);
    } else {
        await Promise.all(authenticationTypes.map(async authenticationType => await checkSingleUserAuthenticationType(auth, authenticationType, databaseType, logger.nextIndent)));
    }
}

async function checkSingleUserAuthenticationType(
    auth: AuthData,
    authenticationType: UserAuthenticationType,
    databaseType: DatabaseType,
    logger: ILogger
) {
    logger.log('checkSingleUserAuthenticationType', { auth: auth, authenticationType: authenticationType, databaseType: databaseType });
    const reference = DatabaseReference.base<DatabaseScheme>(getPrivateKeys(databaseType)).child('users').child('authentication').child(authenticationType).child(Crypter.sha512(auth.uid));
    const snapshot = await reference.snapshot();
    if (!snapshot.exists)
        throw HttpsError('permission-denied', `The function must be called while authenticated, not authenticated for ${authenticationType}.`, logger);
    if (snapshot.value('decrypt').state === 'unauthenticated')
        throw HttpsError('permission-denied', `The function must be called while authenticated, unauthenticated for ${authenticationType}.`, logger);
}
