import { type DatabaseType, type IFirebaseFunction, type ILogger, ParameterParser, type IFunctionType, IDatabaseReference, IParameterContainer, sha512 } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { User } from '../types/User';
import { DatabaseScheme } from '../DatabaseScheme';

export class UserGetRolesFunction implements IFirebaseFunction<UserGetRolesFunctionType> {
    public readonly parameters: IFunctionType.Parameters<UserGetRolesFunctionType> & { databaseType: DatabaseType };

    public constructor(
        parameterContainer: IParameterContainer, 
        private readonly auth: AuthData | null, 
        private readonly databaseReference: IDatabaseReference<DatabaseScheme>, 
        private readonly logger: ILogger
    ) {
        this.logger.log('UserGetRolesFunction.constructor', { auth: auth }, 'notice');
        const parameterParser = new ParameterParser<IFunctionType.Parameters<UserGetRolesFunctionType>>({}, this.logger.nextIndent);
        parameterParser.parse(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async execute(): Promise<IFunctionType.ReturnType<UserGetRolesFunctionType>> {
        this.logger.log('UserGetRolesFunction.executeFunction', {}, 'info');    
        if (this.auth === null)
            return null;
        const hashedUserId = sha512(this.auth.uid);
        const reference = this.databaseReference.child('users').child(hashedUserId);
        const snapshot = await reference.snapshot();
        if (!snapshot.exists)
            return null;
        const roles = snapshot.value('decrypt').roles;
        if (roles === 'unauthenticated')
            return null;
        return roles;
    }
}

export type UserGetRolesFunctionType = IFunctionType<Record<string, never>, User.Role[] | null>;
