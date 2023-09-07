import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, type FunctionType, HttpsError, DatabaseReference } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { getPrivateKeys } from '../privateKeys';
import { checkUserRoles } from '../checkUserRoles';
import { User } from '../types/User';
import { DatabaseScheme } from '../DatabaseScheme';

export class UserEditRolesFunction implements FirebaseFunction<UserEditRolesFunctionType> {
    public readonly parameters: FunctionType.Parameters<UserEditRolesFunctionType> & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, private readonly auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('UserEditRolesFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getPrivateKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<FunctionType.Parameters<UserEditRolesFunctionType>>(
            {
                hashedUserId: ParameterBuilder.value('string'),
                roles: ParameterBuilder.array(ParameterBuilder.guard('string', User.Role.typeGuard))
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<UserEditRolesFunctionType>> {
        this.logger.log('UserEditRolesFunction.executeFunction', {}, 'info');
        const myHashedUserId = await checkUserRoles(this.auth, 'admin', this.parameters.databaseType, this.logger.nextIndent);
        if (this.parameters.hashedUserId === myHashedUserId && !this.parameters.roles.includes('admin'))
            throw HttpsError('unavailable', 'Couldn\'t remove admin role from yourself.', this.logger);
        const reference = DatabaseReference.base<DatabaseScheme>(getPrivateKeys(this.parameters.databaseType)).child('users').child(this.parameters.hashedUserId);
        const snapshot = await reference.snapshot();
        if (!snapshot.exists)
            throw HttpsError('not-found', 'User not found.', this.logger);
        const user = snapshot.value('decrypt');
        if (user.roles === 'unauthenticated')
            throw HttpsError('unauthenticated', 'User is not authenticated.', this.logger);
        user.roles = this.parameters.roles;
        await reference.set(user, 'encrypt');
    }
}

export type UserEditRolesFunctionType = FunctionType<{
    hashedUserId: string;
    roles: User.Role[];
}, void>;
