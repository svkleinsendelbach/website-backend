import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterContainer, ParameterParser, type FunctionType, ParameterBuilder } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkUserRoles } from '../checkUserRoles';
import { DatabaseScheme } from '../DatabaseScheme';
import { getPrivateKeys } from '../privateKeys';
import { User } from '../types/User';

export class UserGetAllFunction implements FirebaseFunction<UserGetAllFunctionType> {
    public readonly parameters: FunctionType.Parameters<UserGetAllFunctionType> & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, private readonly auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('UserGetAllFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getPrivateKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<FunctionType.Parameters<UserGetAllFunctionType>>({
            type: ParameterBuilder.nullable(ParameterBuilder.guard('string', (value): value is 'authenticated' | 'unauthenticated' => value === 'authenticated' || value === 'unauthenticated'))
        }, this.logger.nextIndent);
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<UserGetAllFunctionType>> {
        this.logger.log('UserGetAllFunction.executeFunction', {}, 'info');
        await checkUserRoles(this.auth, 'admin', this.parameters.databaseType, this.logger);
        const reference = DatabaseScheme.reference(this.parameters.databaseType).child('users');
        const snapshot = await reference.snapshot();
        return snapshot.compactMap(snapshot => {
            if (snapshot.key === null)
                return null;
            const user: User = {
                ...snapshot.value('decrypt'),
                hashedUserId: snapshot.key
            };
            if (this.parameters.type === null || (user.roles === 'unauthenticated' && this.parameters.type === 'unauthenticated') || (user.roles !== 'unauthenticated' && this.parameters.type === 'authenticated'))
                return user;
            return null;
        });
    }
}

export type UserGetAllFunctionType = FunctionType<{
    type: 'authenticated' | 'unauthenticated' | null;
}, User[]>;
