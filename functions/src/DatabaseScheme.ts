import { type CryptedScheme, type DatabaseSchemeType } from 'firebase-function';
import { type UserAuthentication, type UserAuthenticationType } from './types/UserAuthentication';

export type DatabaseScheme = DatabaseSchemeType<{
    users: {
        authentication: {
            [key in UserAuthenticationType]: CryptedScheme<UserAuthentication>;
        };
    };
}>;
