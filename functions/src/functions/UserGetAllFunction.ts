import { type DatabaseType, type IFirebaseFunction, type ILogger, ParameterParser, type IFunctionType, IDatabaseReference, IParameterContainer, NullableParameterBuilder, GuardParameterBuilder } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkUserRoles } from '../checkUserRoles';
import { DatabaseScheme } from '../DatabaseScheme';
import { User } from '../types/User';

export class UserGetAllFunction implements IFirebaseFunction<UserGetAllFunctionType> {
    public readonly parameters: IFunctionType.Parameters<UserGetAllFunctionType> & { databaseType: DatabaseType };

    public constructor(
        parameterContainer: IParameterContainer, 
        private readonly auth: AuthData | null, 
        private readonly databaseReference: IDatabaseReference<DatabaseScheme>, 
        private readonly logger: ILogger
    ) {
        this.logger.log('UserGetAllFunction.constructor', { auth: auth }, 'notice');
        const parameterParser = new ParameterParser<IFunctionType.Parameters<UserGetAllFunctionType>>({
            type: new NullableParameterBuilder(new GuardParameterBuilder('string', (value): value is 'authenticated' | 'unauthenticated' => value === 'authenticated' || value === 'unauthenticated'))
        }, this.logger.nextIndent);
        parameterParser.parse(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async execute(): Promise<IFunctionType.ReturnType<UserGetAllFunctionType>> {
        this.logger.log('UserGetAllFunction.executeFunction', {}, 'info');
        await checkUserRoles(this.auth, 'admin', this.databaseReference, this.logger);
        const reference = this.databaseReference.child('users');
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

export type UserGetAllFunctionType = IFunctionType<{
    type: 'authenticated' | 'unauthenticated' | null;
}, User[]>;
