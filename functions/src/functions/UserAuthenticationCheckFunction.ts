import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkUserAuthentication } from '../checkUserAuthentication';
import { getCryptionKeys } from '../privateKeys';
import { UserAuthenticationType } from '../types/UserAuthentication';

export class UserAuthenticationCheckFunction implements FirebaseFunction<UserAuthenticationCheckFunction.Parameters, UserAuthenticationCheckFunction.ReturnType> {
    public readonly parameters: UserAuthenticationCheckFunction.Parameters & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, private readonly auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('UserAuthenticationCheckFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getCryptionKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<UserAuthenticationCheckFunction.Parameters>(
            {
                type: ParameterBuilder.guard('string', UserAuthenticationType.typeGuard)
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<UserAuthenticationCheckFunction.ReturnType> {
        this.logger.log('UserAuthenticationCheckFunction.executeFunction', {}, 'info');
        await checkUserAuthentication(this.auth, this.parameters.type, this.parameters.databaseType, this.logger.nextIndent);
    }
}

export namespace UserAuthenticationCheckFunction {
    export type Parameters = {
        type: UserAuthenticationType;
    };

    export type ReturnType = void;
}
