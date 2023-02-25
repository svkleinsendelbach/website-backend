import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, DatabaseReference, HttpsError } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkUserAuthentication } from '../checkUserAuthentication';
import { type DatabaseScheme } from '../DatabaseScheme';
import { getCallKey, getCryptionKeys, getDatabaseUrl } from '../privateKeys';
import { UserAuthenticationType } from '../types/UserAuthentication';

export class UserAuthenticationAcceptDeclineFunction implements FirebaseFunction<UserAuthenticationAcceptDeclineFunction.Parameters, UserAuthenticationAcceptDeclineFunction.ReturnType> {
    public readonly parameters: UserAuthenticationAcceptDeclineFunction.Parameters & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, private readonly auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('UserAuthenticationAcceptDeclineFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getCryptionKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<UserAuthenticationAcceptDeclineFunction.Parameters>(
            {
                callKey: ParameterBuilder.value('string'),
                type: ParameterBuilder.guard('string', UserAuthenticationType.typeGuard),
                hashedUserId: ParameterBuilder.value('string'),
                action: ParameterBuilder.guard('string', (value: string): value is 'accept' | 'decline' => value === 'accept' || value === 'decline')
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<UserAuthenticationAcceptDeclineFunction.ReturnType> {
        this.logger.log('UserAuthenticationAcceptDeclineFunction.executeFunction', {}, 'info');
        if (this.parameters.callKey !== getCallKey(this.parameters.databaseType))
            throw HttpsError('permission-denied', 'Call key is not valid for this function call.', this.logger);
        await checkUserAuthentication(this.auth, 'websiteEditing', this.parameters.databaseType, this.logger);
        const reference = DatabaseReference.base<DatabaseScheme>(getDatabaseUrl(this.parameters.databaseType), getCryptionKeys(this.parameters.databaseType)).child('users').child('authentication').child(this.parameters.type).child(this.parameters.hashedUserId);
        const snapshot = await reference.snapshot();
        if (!snapshot.exists)
            return;
        const userAuthentication = snapshot.value(true);
        if (userAuthentication.state === 'authenticated')
            return;
        if (this.parameters.action === 'accept') {
            userAuthentication.state = 'authenticated';
            await reference.set(userAuthentication, true);
        } else {
            await reference.remove();
        }
    }
}

export namespace UserAuthenticationAcceptDeclineFunction {
    export type Parameters = {
        callKey: string;
        type: UserAuthenticationType;
        hashedUserId: string;
        action: 'accept' | 'decline';
    };

    export type ReturnType = void;
}
