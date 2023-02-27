import { type DatabaseType, HttpsError, type ILogger, DatabaseReference, Crypter } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { type DatabaseScheme } from './DatabaseScheme';
import { getCryptionKeys, getDatabaseUrl } from './privateKeys';
import { type UserAuthenticationType } from './types/UserAuthentication';

export async function checkUserAuthentication(
    auth: AuthData | undefined,
    type: UserAuthenticationType,
    databaseType: DatabaseType,
    logger: ILogger
) {
    logger.log('checkUserAuthentication', { auth: auth, type: type, databaseType: databaseType });
    if (auth === undefined)
        throw HttpsError('permission-denied', 'The function must be called while authenticated, nobody signed in.', logger);
    const reference = DatabaseReference.base<DatabaseScheme>(getDatabaseUrl(databaseType), getCryptionKeys(databaseType)).child('users').child('authentication').child(type).child(Crypter.sha512(auth.uid));
    const snapshot = await reference.snapshot();
    if (!snapshot.exists)
        throw HttpsError('permission-denied', `The function must be called while authenticated, not authenticated for ${type}.`, logger);
    if (snapshot.value(true).state === 'unauthenticated')
        throw HttpsError('permission-denied', `The function must be called while authenticated, unauthenticated for ${type}.`, logger);
}
