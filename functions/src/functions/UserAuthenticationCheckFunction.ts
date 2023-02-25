import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, HttpsError } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkUserAuthentication } from '../checkUserAuthentication';
import { getCallKey, getCryptionKeys } from '../privateKeys';
import { UserAuthenticationType } from '../types/UserAuthentication';

export class UserAuthenticationCheckFunction implements FirebaseFunction<UserAuthenticationCheckFunction.Parameters, UserAuthenticationCheckFunction.ReturnType> {
    public readonly parameters: UserAuthenticationCheckFunction.Parameters & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, private readonly auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('UserAuthenticationCheckFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getCryptionKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<UserAuthenticationCheckFunction.Parameters>(
            {
                callKey: ParameterBuilder.value('string'),
                type: ParameterBuilder.guard('string', UserAuthenticationType.typeGuard)
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<UserAuthenticationCheckFunction.ReturnType> {
        this.logger.log('UserAuthenticationCheckFunction.executeFunction', {}, 'info');
        if (this.parameters.callKey !== getCallKey(this.parameters.databaseType))
            throw HttpsError('permission-denied', 'Call key is not valid for this function call.', this.logger);
        await checkUserAuthentication(this.auth, this.parameters.type, this.parameters.databaseType, this.logger.nextIndent);
    }
}

export namespace UserAuthenticationCheckFunction {
    export type Parameters = {
        callKey: string;
        type: UserAuthenticationType;
    };

    export type ReturnType = void;
}
