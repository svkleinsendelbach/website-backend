import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, type FunctionType } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkUserRoles } from '../checkUserRoles';
import { getPrivateKeys } from '../privateKeys';
import { User } from '../types/User';

export class UserCheckRolesFunction implements FirebaseFunction<UserCheckRolesFunctionType> {
    public readonly parameters: FunctionType.Parameters<UserCheckRolesFunctionType> & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, private readonly auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('UserCheckRolesFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getPrivateKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<FunctionType.Parameters<UserCheckRolesFunctionType>>(
            {
                roles: ParameterBuilder.array(ParameterBuilder.guard('string', User.Role.typeGuard))
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<UserCheckRolesFunctionType>> {
        this.logger.log('UserCheckRolesFunction.executeFunction', {}, 'info');
        await checkUserRoles(this.auth, this.parameters.roles, this.parameters.databaseType, this.logger.nextIndent);
    }
}

export type UserCheckRolesFunctionType = FunctionType<{
    roles: User.Role[];
}, void>;
