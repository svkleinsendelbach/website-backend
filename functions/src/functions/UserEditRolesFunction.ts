import { type DatabaseType, type IFirebaseFunction, type ILogger, IParameterContainer, ParameterParser, type IFunctionType, HttpsError, IDatabaseReference, ValueParameterBuilder, ArrayParameterBuilder, GuardParameterBuilder } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkUserRoles } from '../checkUserRoles';
import { User } from '../types/User';
import { DatabaseScheme } from '../DatabaseScheme';

export class UserEditRolesFunction implements IFirebaseFunction<UserEditRolesFunctionType> {
    public readonly parameters: IFunctionType.Parameters<UserEditRolesFunctionType> & { databaseType: DatabaseType };

    public constructor(
        parameterContainer: IParameterContainer, 
        private readonly auth: AuthData | null, 
        private readonly databaseReference: IDatabaseReference<DatabaseScheme>, 
        private readonly logger: ILogger
    ) {
        this.logger.log('UserEditRolesFunction.constructor', { auth: auth }, 'notice');
        const parameterParser = new ParameterParser<IFunctionType.Parameters<UserEditRolesFunctionType>>(
            {
                hashedUserId: new ValueParameterBuilder('string'),
                roles: new ArrayParameterBuilder(new GuardParameterBuilder('string', User.Role.typeGuard))
            },
            this.logger.nextIndent
        );
        parameterParser.parse(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async execute(): Promise<IFunctionType.ReturnType<UserEditRolesFunctionType>> {
        this.logger.log('UserEditRolesFunction.executeFunction', {}, 'info');
        const myHashedUserId = await checkUserRoles(this.auth, 'admin', this.databaseReference, this.logger.nextIndent);
        if (this.parameters.hashedUserId === myHashedUserId && !this.parameters.roles.includes('admin'))
            throw HttpsError('unavailable', 'Couldn\'t remove admin role from yourself.', this.logger);
        const reference = this.databaseReference.child('users').child(this.parameters.hashedUserId);
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

export type UserEditRolesFunctionType = IFunctionType<{
    hashedUserId: string;
    roles: User.Role[];
}, void>;
