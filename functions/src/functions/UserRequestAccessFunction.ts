import { type DatabaseType, type IFirebaseFunction, type ILogger, ParameterParser, HttpsError, type IFunctionType, IParameterContainer, IDatabaseReference, sha512, ValueParameterBuilder } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { DatabaseScheme } from '../DatabaseScheme';

export class UserRequestAccessFunction implements IFirebaseFunction<UserRequestAccessFunctionType> {
    public readonly parameters: IFunctionType.Parameters<UserRequestAccessFunctionType> & { databaseType: DatabaseType };

    public constructor(
        parameterContainer: IParameterContainer, 
        private readonly auth: AuthData | null, 
        private readonly databaseReference: IDatabaseReference<DatabaseScheme>, 
        private readonly logger: ILogger
    ) {
        this.logger.log('UserRequestAccessFunction.constructor', { auth: auth }, 'notice');
        const parameterParser = new ParameterParser<IFunctionType.Parameters<UserRequestAccessFunctionType>>(
            {
                firstName: new ValueParameterBuilder('string'),
                lastName: new ValueParameterBuilder('string')
            },
            this.logger.nextIndent
        );
        parameterParser.parse(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async execute(): Promise<IFunctionType.ReturnType<UserRequestAccessFunctionType>> {
        this.logger.log('UserRequestAccessFunction.executeFunction', {}, 'info');
        if (this.auth === null)
            throw HttpsError('permission-denied', 'The function must be called while authenticated, nobody signed in.', this.logger);
        const reference = this.databaseReference.child('users').child(sha512(this.auth.uid));
        const snapshot = await reference.snapshot();
        if (snapshot.exists)
            throw HttpsError('already-exists', 'User has already requested access.', this.logger);
        await reference.set({
            firstName: this.parameters.firstName,
            lastName: this.parameters.lastName,
            roles: 'unauthenticated'
        }, 'encrypt');
    }
}

export type UserRequestAccessFunctionType = IFunctionType<{
    firstName: string;
    lastName: string;
}, void>;
