import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, DatabaseReference, type FunctionType, HttpsError } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkUserRoles } from '../checkUserRoles';
import { type DatabaseScheme } from '../DatabaseScheme';
import { getPrivateKeys } from '../privateKeys';

export class UserHandleAccessRequestFunction implements FirebaseFunction<UserHandleAccessRequestFunctionType> {
    public readonly parameters: FunctionType.Parameters<UserHandleAccessRequestFunctionType> & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, private readonly auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('UserHandleAccessRequestFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getPrivateKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<FunctionType.Parameters<UserHandleAccessRequestFunctionType>>(
            {
                hashedUserId: ParameterBuilder.value('string'),
                handleRequest: ParameterBuilder.guard('string', (value: string): value is 'accept' | 'decline' => value === 'accept' || value === 'decline')
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<UserHandleAccessRequestFunctionType>> {
        this.logger.log('UserHandleAccessRequestFunction.executeFunction', {}, 'info');
        await checkUserRoles(this.auth, 'admin', this.parameters.databaseType, this.logger);
        const reference = DatabaseReference.base<DatabaseScheme>(getPrivateKeys(this.parameters.databaseType)).child('users').child(this.parameters.hashedUserId);
        const snapshot = await reference.snapshot();
        if (!snapshot.exists)
            throw HttpsError('not-found', 'User not found.', this.logger);
        const user = snapshot.value('decrypt');
        if (user.roles !== 'unauthenticated')
            throw HttpsError('unavailable', 'User is already authenticated.', this.logger);
        if (this.parameters.handleRequest === 'accept') {
            user.roles = [];
            await reference.set(user, 'encrypt');
        } else {
            await reference.remove();
        }
    }
}

export type UserHandleAccessRequestFunctionType = FunctionType<{
    hashedUserId: string;
    handleRequest: 'accept' | 'decline';
}, void>;
