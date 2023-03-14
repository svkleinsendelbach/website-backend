import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, DatabaseReference, type FunctionType } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkUserAuthentication } from '../checkUserAuthentication';
import { type DatabaseScheme } from '../DatabaseScheme';
import { getPrivateKeys } from '../privateKeys';
import { UserAuthenticationType } from '../types/UserAuthentication';
import { uniqueKeyedList } from '../utils';

export class UserAuthenticationGetAllUnauthenticatedFunction implements FirebaseFunction<UserAuthenticationGetAllUnauthenticatedFunctionType> {
    public readonly parameters: FunctionType.Parameters<UserAuthenticationGetAllUnauthenticatedFunctionType> & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, private readonly auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('UserAuthenticationGetAllUnauthenticatedFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getPrivateKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<FunctionType.Parameters<UserAuthenticationGetAllUnauthenticatedFunctionType>>(
            {
                authenticationTypes: ParameterBuilder.array(ParameterBuilder.guard('string', UserAuthenticationType.typeGuard))
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<UserAuthenticationGetAllUnauthenticatedFunctionType>> {
        this.logger.log('UserAuthenticationGetAllUnauthenticatedFunction.executeFunction', {}, 'info');
        await checkUserAuthentication(this.auth, 'authenticateUser', this.parameters.databaseType, this.logger);
        const duplicatedUsers = await Promise.all(this.parameters.authenticationTypes.map(async authenticationType => await this.getAllUnauthenticated(authenticationType)));
        return uniqueKeyedList(duplicatedUsers.flatMap(users => users), user => user.hashedUserId);
    }

    private async getAllUnauthenticated(authenticationType: UserAuthenticationType): Promise<FunctionType.ReturnType<UserAuthenticationGetAllUnauthenticatedFunctionType>> {
        const reference = DatabaseReference.base<DatabaseScheme>(getPrivateKeys(this.parameters.databaseType)).child('users').child('authentication').child(authenticationType);
        const snapshot = await reference.snapshot();
        return snapshot.compactMap(snapshot => {
            const userAuthentication = snapshot.value('decrypt');
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

export namespace UserAuthenticationGetAllUnauthenticatedFunction {
    export type User = {
        hashedUserId: string;
        firstName: string;
        lastName: string;
    };
}

export type UserAuthenticationGetAllUnauthenticatedFunctionType = FunctionType<{
    authenticationTypes: UserAuthenticationType[];
}, UserAuthenticationGetAllUnauthenticatedFunction.User[]>;
