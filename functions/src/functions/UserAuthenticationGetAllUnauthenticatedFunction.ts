import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, DatabaseReference, type FunctionType } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkUserAuthentication } from '../checkUserAuthentication';
import { type DatabaseScheme } from '../DatabaseScheme';
import { getCryptionKeys, getDatabaseUrl } from '../privateKeys';
import { UserAuthenticationType } from '../types/UserAuthentication';

export class UserAuthenticationGetAllUnauthenticatedFunction implements FirebaseFunction<UserAuthenticationGetAllUnauthenticatedFunctionType> {
    public readonly parameters: FunctionType.Parameters<UserAuthenticationGetAllUnauthenticatedFunctionType> & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, private readonly auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('UserAuthenticationGetAllUnauthenticatedFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getCryptionKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<FunctionType.Parameters<UserAuthenticationGetAllUnauthenticatedFunctionType>>(
            {
                type: ParameterBuilder.guard('string', UserAuthenticationType.typeGuard)
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<UserAuthenticationGetAllUnauthenticatedFunctionType>> {
        this.logger.log('UserAuthenticationGetAllUnauthenticatedFunction.executeFunction', {}, 'info');
        await checkUserAuthentication(this.auth, 'websiteEditing', this.parameters.databaseType, this.logger);
        const reference = DatabaseReference.base<DatabaseScheme>(getDatabaseUrl(this.parameters.databaseType), getCryptionKeys(this.parameters.databaseType)).child('users').child('authentication').child(this.parameters.type);
        const snapshot = await reference.snapshot();
        return snapshot.compactMap(snapshot => {
            const userAuthentication = snapshot.value(true);
            if (snapshot.key === null || userAuthentication.state !== 'unauthenticated')
                return null;
            return {
                hashedUserId: snapshot.key,
                firstName: userAuthentication.firstName,
                lastName: userAuthentication.lastName
            };
        });
    }
}

export type UserAuthenticationGetAllUnauthenticatedFunctionType = FunctionType<{
    type: UserAuthenticationType;
}, Array<{
    hashedUserId: string;
    firstName: string;
    lastName: string;
}>>;
