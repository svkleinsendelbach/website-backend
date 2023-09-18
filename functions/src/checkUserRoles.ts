import { type DatabaseType, HttpsError, type ILogger, Crypter } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { DatabaseScheme } from './DatabaseScheme';
import { type User } from './types/User';

export async function checkUserRoles(
    auth: AuthData | undefined,
    roles: User.Role | User.Role[],
    databaseType: DatabaseType,
    logger: ILogger
): Promise<string> {
    logger.log('checkUserRoles', { auth: auth, roles: roles, databaseType: databaseType });
    if (auth === undefined)
        throw HttpsError('permission-denied', 'The function must be called while authenticated, nobody signed in.', logger);
    const hashedUserId = Crypter.sha512(auth.uid);
    const reference = DatabaseScheme.reference(databaseType).child('users').child(hashedUserId);
    const snapshot = await reference.snapshot();
    if (!snapshot.exists)
        throw HttpsError('permission-denied', 'The function must be called while authenticated, user doesn\'t exist.', logger);
    const actualRoles = snapshot.value('decrypt').roles;
    if (actualRoles === 'unauthenticated')
        throw HttpsError('permission-denied', 'The function must be called while authenticated, user is unauthenticated.', logger);
    let expectedRoles = typeof roles === 'string' ? [roles] : roles;
    for (const expectedRole of expectedRoles) {
        if (actualRoles.includes(expectedRole))
            expectedRoles = expectedRoles.filter(role => role !== expectedRole);
    }
    if (expectedRoles.length !== 0)
        throw HttpsError('permission-denied', `The function must be called while authenticated, missing roles: ${expectedRoles.join(', ')}.`, logger);
    return hashedUserId;
}
