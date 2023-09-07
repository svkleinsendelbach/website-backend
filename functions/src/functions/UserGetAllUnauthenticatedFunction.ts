import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterContainer, ParameterParser, DatabaseReference, type FunctionType } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkUserRoles } from '../checkUserRoles';
import { type DatabaseScheme } from '../DatabaseScheme';
import { getPrivateKeys } from '../privateKeys';
import { User } from '../types/User';

export class UserGetAllUnauthenticatedFunction implements FirebaseFunction<UserGetAllUnauthenticatedFunctionType> {
    public readonly parameters: FunctionType.Parameters<UserGetAllUnauthenticatedFunctionType> & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, private readonly auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('UserGetAllUnauthenticatedFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getPrivateKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<FunctionType.Parameters<UserGetAllUnauthenticatedFunctionType>>({}, this.logger.nextIndent);
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<UserGetAllUnauthenticatedFunctionType>> {
        this.logger.log('UserGetAllUnauthenticatedFunction.executeFunction', {}, 'info');
        await checkUserRoles(this.auth, 'admin', this.parameters.databaseType, this.logger);
        const reference = DatabaseReference.base<DatabaseScheme>(getPrivateKeys(this.parameters.databaseType)).child('users');
        const snapshot = await reference.snapshot();
        return snapshot.compactMap(snapshot => {
            if (snapshot.key === null)
                return null;
            const user: User = {
                ...snapshot.value('decrypt'),
                hashedUserId: snapshot.key
            };
            if (user.roles !== 'unauthenticated')
                return null;
            return user;
        });
    }
}

export type UserGetAllUnauthenticatedFunctionType = FunctionType<{}, User[]>;
