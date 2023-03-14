import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, type FunctionType } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkUserAuthentication } from '../checkUserAuthentication';
import { getPrivateKeys } from '../privateKeys';
import { UserAuthenticationType } from '../types/UserAuthentication';

export class UserAuthenticationCheckFunction implements FirebaseFunction<UserAuthenticationCheckFunctionType> {
    public readonly parameters: FunctionType.Parameters<UserAuthenticationCheckFunctionType> & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, private readonly auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('UserAuthenticationCheckFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getPrivateKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<FunctionType.Parameters<UserAuthenticationCheckFunctionType>>(
            {
                authenicationTypes: ParameterBuilder.array(ParameterBuilder.guard('string', UserAuthenticationType.typeGuard))
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<UserAuthenticationCheckFunctionType>> {
        this.logger.log('UserAuthenticationCheckFunction.executeFunction', {}, 'info');
        await checkUserAuthentication(this.auth, this.parameters.authenicationTypes, this.parameters.databaseType, this.logger.nextIndent);
    }
}

export type UserAuthenticationCheckFunctionType = FunctionType<{
    authenicationTypes: UserAuthenticationType[];
}, void>;
