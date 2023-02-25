import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, Crypter, DatabaseReference, HttpsError } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { type DatabaseScheme } from '../DatabaseScheme';
import { getCallKey, getCryptionKeys, getDatabaseUrl } from '../privateKeys';
import { UserAuthenticationType } from '../types/UserAuthentication';

export class UserAuthenticationAddFunction implements FirebaseFunction<UserAuthenticationAddFunction.Parameters, UserAuthenticationAddFunction.ReturnType> {
    public readonly parameters: UserAuthenticationAddFunction.Parameters & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, private readonly auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('UserAuthenticationAddFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getCryptionKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<UserAuthenticationAddFunction.Parameters>(
            {
                callKey: ParameterBuilder.value('string'),
                type: ParameterBuilder.guard('string', UserAuthenticationType.typeGuard),
                firstName: ParameterBuilder.value('string'),
                lastName: ParameterBuilder.value('string')
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<UserAuthenticationAddFunction.ReturnType> {
        this.logger.log('UserAuthenticationAddFunction.executeFunction', {}, 'info');
        if (this.parameters.callKey !== getCallKey(this.parameters.databaseType))
            throw HttpsError('permission-denied', 'Call key is not valid for this function call.', this.logger);
        if (this.auth === undefined)
            throw HttpsError('permission-denied', 'The function must be called while authenticated, nobody signed in.', this.logger);
        const reference = DatabaseReference.base<DatabaseScheme>(getDatabaseUrl(this.parameters.databaseType), getCryptionKeys(this.parameters.databaseType)).child('users').child('authentication').child(this.parameters.type).child(Crypter.sha512(this.auth.uid));
        await reference.set({
            state: 'unauthenticated',
            firstName: this.parameters.firstName,
            lastName: this.parameters.lastName
        }, true);
    }
}

export namespace UserAuthenticationAddFunction {
    export type Parameters = {
        callKey: string;
        type: UserAuthenticationType;
        firstName: string;
        lastName: string;
    };

    export type ReturnType = void;
}
