import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, Crypter, HttpsError, type FunctionType } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { DatabaseScheme } from '../DatabaseScheme';
import { getPrivateKeys } from '../privateKeys';

export class UserRequestAccessFunction implements FirebaseFunction<UserRequestAccessFunctionType> {
    public readonly parameters: FunctionType.Parameters<UserRequestAccessFunctionType> & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, private readonly auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('UserRequestAccessFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getPrivateKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<FunctionType.Parameters<UserRequestAccessFunctionType>>(
            {
                firstName: ParameterBuilder.value('string'),
                lastName: ParameterBuilder.value('string')
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<UserRequestAccessFunctionType>> {
        this.logger.log('UserRequestAccessFunction.executeFunction', {}, 'info');
        if (this.auth === undefined)
            throw HttpsError('permission-denied', 'The function must be called while authenticated, nobody signed in.', this.logger);
        const reference = DatabaseScheme.reference(this.parameters.databaseType).child('users').child(Crypter.sha512(this.auth.uid));
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

export type UserRequestAccessFunctionType = FunctionType<{
    firstName: string;
    lastName: string;
}, void>;
