import { AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { DatabaseType } from '../classes/DatabaseType';
import { FiatShamirParameters } from '../classes/FiatShamirParameters';
import { Crypter } from '../crypter/Crypter';
import { cryptionKeys } from '../privateKeys';
import { checkFiatShamir } from './fiatShamir';
import { FirebaseDatabase } from './FirebaseDatabase';
import { Logger } from './Logger';
import { httpsError } from './utils';
import { sha512 } from 'sha512-crypt-ts';

export async function checkPrerequirements(
    parameters: {
        databaseType: DatabaseType,
        fiatShamirParameters: FiatShamirParameters,
    },
    logger: Logger,
    auth?: AuthData | 'notRequired'
) {
    logger.log('checkPrerequirements', { parameters, auth });
    
    // Check if user is authorized to call a function.
    if (auth === undefined)
        throw httpsError('permission-denied', 'The function must be called while authenticated, nobody signed in.', logger);

    // Check fiat shamir
    await checkFiatShamir(parameters.fiatShamirParameters, parameters.databaseType, logger.nextIndent);

}

export type UserAuthenticationType = 'websiteEditing';

export interface UserAuthentication {
    state: 'authenticated' | 'unauthenticated',
    firstName: string,
    lastName: string
}

export namespace UserAuthenticationType {
    export function isValid(value: string): value is UserAuthenticationType {
        return [
            'websiteEditing'
        ].includes(value);
    }
}

export async function checkUserAuthentication(auth: AuthData | undefined, type: UserAuthenticationType, databaseType: DatabaseType, logger: Logger) {

    // Check if a user is signed in
    if (auth === undefined)
        throw httpsError('permission-denied', 'The function must be called while authenticated, nobody signed in.', logger);

    // Check if a user is authenticated
    const hashedUserId = sha512.base64(auth.uid);
    const crypter = new Crypter(cryptionKeys(databaseType));
    const reference = FirebaseDatabase.Reference.fromPath(`users/authentication/${type}/${hashedUserId}`, databaseType);
    const snapshot = await reference.snapshot<string>();
    if (!snapshot.exists)
        throw httpsError('permission-denied', `The function must be called while authenticated, not authenticated in for ${type}.`, logger);    
    const userAuthentication: UserAuthentication = crypter.decryptDecode(snapshot.value);
    if (userAuthentication.state === 'unauthenticated')
        throw httpsError('permission-denied', `The function must be called while authenticated, unauthenticated for ${type}.`, logger);    
}
