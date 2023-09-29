import { type DatabaseType, type IFirebaseFunction, type ILogger, ParameterParser, type IFunctionType, HttpsError, IDatabaseReference, IParameterContainer, ValueParameterBuilder, GuardParameterBuilder } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkUserRoles } from '../checkUserRoles';
import { DatabaseScheme } from '../DatabaseScheme';

export class UserHandleAccessRequestFunction implements IFirebaseFunction<UserHandleAccessRequestFunctionType> {
    public readonly parameters: IFunctionType.Parameters<UserHandleAccessRequestFunctionType> & { databaseType: DatabaseType };

    public constructor(
        parameterContainer: IParameterContainer, 
        private readonly auth: AuthData | null, 
        private readonly databaseReference: IDatabaseReference<DatabaseScheme>, 
        private readonly logger: ILogger
    ) {
        this.logger.log('UserHandleAccessRequestFunction.constructor', { auth: auth }, 'notice');
        const parameterParser = new ParameterParser<IFunctionType.Parameters<UserHandleAccessRequestFunctionType>>(
            {
                hashedUserId: new ValueParameterBuilder('string'),
                handleRequest: new GuardParameterBuilder('string', (value: string): value is 'accept' | 'decline' => value === 'accept' || value === 'decline')
            },
            this.logger.nextIndent
        );
        parameterParser.parse(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async execute(): Promise<IFunctionType.ReturnType<UserHandleAccessRequestFunctionType>> {
        this.logger.log('UserHandleAccessRequestFunction.executeFunction', {}, 'info');
        await checkUserRoles(this.auth, 'admin', this.databaseReference, this.logger);
        const reference = this.databaseReference.child('users').child(this.parameters.hashedUserId);
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

export type UserHandleAccessRequestFunctionType = IFunctionType<{
    hashedUserId: string;
    handleRequest: 'accept' | 'decline';
}, void>;
