import { type DatabaseType, type IFirebaseFunction, type ILogger, ParameterParser, type IFunctionType, IDatabaseReference, IParameterContainer, ArrayParameterBuilder, GuardParameterBuilder } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkUserRoles } from '../checkUserRoles';
import { User } from '../types/User';
import { DatabaseScheme } from '../DatabaseScheme';

export class UserCheckRolesFunction implements IFirebaseFunction<UserCheckRolesFunctionType> {
    public readonly parameters: IFunctionType.Parameters<UserCheckRolesFunctionType> & { databaseType: DatabaseType };

    public constructor(
        parameterContainer: IParameterContainer, 
        private readonly auth: AuthData | null, 
        private readonly databaseReference: IDatabaseReference<DatabaseScheme>, 
        private readonly logger: ILogger
    ) {
        this.logger.log('UserCheckRolesFunction.constructor', { auth: auth }, 'notice');
        const parameterParser = new ParameterParser<IFunctionType.Parameters<UserCheckRolesFunctionType>>(
            {
                roles: new ArrayParameterBuilder(new GuardParameterBuilder('string', User.Role.typeGuard))
            },
            this.logger.nextIndent
        );
        parameterParser.parse(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async execute(): Promise<IFunctionType.ReturnType<UserCheckRolesFunctionType>> {
        this.logger.log('UserCheckRolesFunction.executeFunction', {}, 'info');
        await checkUserRoles(this.auth, this.parameters.roles, this.databaseReference, this.logger.nextIndent);
    }
}

export type UserCheckRolesFunctionType = IFunctionType<{
    roles: User.Role[];
}, void>;
