import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, Crypter, DatabaseReference, HttpsError, type FunctionType } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { type DatabaseScheme } from '../DatabaseScheme';
import { getPrivateKeys } from '../privateKeys';
import { UserAuthenticationType } from '../types/UserAuthentication';

export class UserAuthenticationAddFunction implements FirebaseFunction<UserAuthenticationAddFunctionType> {
    public readonly parameters: FunctionType.Parameters<UserAuthenticationAddFunctionType> & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, private readonly auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('UserAuthenticationAddFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getPrivateKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<FunctionType.Parameters<UserAuthenticationAddFunctionType>>(
            {
                authenticationTypes: ParameterBuilder.array(ParameterBuilder.guard('string', UserAuthenticationType.typeGuard)),
                firstName: ParameterBuilder.value('string'),
                lastName: ParameterBuilder.value('string')
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<UserAuthenticationAddFunctionType>> {
        this.logger.log('UserAuthenticationAddFunction.executeFunction', {}, 'info');
        if (this.auth === undefined)
            throw HttpsError('permission-denied', 'The function must be called while authenticated, nobody signed in.', this.logger);
        await Promise.all(this.parameters.authenticationTypes.map(async authenticationType => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const reference = DatabaseReference.base<DatabaseScheme>(getPrivateKeys(this.parameters.databaseType)).child('users').child('authentication').child(authenticationType).child(Crypter.sha512(this.auth!.uid));
            await reference.set({
                state: 'unauthenticated',
                firstName: this.parameters.firstName,
                lastName: this.parameters.lastName
            }, 'encrypt');
        }));
    }
}

export type UserAuthenticationAddFunctionType = FunctionType<{
    authenticationTypes: UserAuthenticationType[];
    firstName: string;
    lastName: string;
}, void>;
