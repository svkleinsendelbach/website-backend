import { AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkPrerequirements, checkUserAuthentication, UserAuthenticationType } from '../utils/checkPrerequirements';
import { DatabaseType } from '../classes/DatabaseType';
import { FirebaseFunction } from '../utils/FirebaseFunction';
import { Logger } from '../utils/Logger';
import { ParameterContainer } from '../utils/Parameter/ParameterContainer';
import { ParameterParser } from '../utils/Parameter/ParameterParser';
import { ParameterBuilder } from '../utils/Parameter/ParameterBuilder';
import { FiatShamirParameters } from '../classes/FiatShamirParameters';

export class CheckUserAuthenticationFunction implements FirebaseFunction<
    CheckUserAuthenticationFunction.Parameters,
    CheckUserAuthenticationFunction.ReturnType
> {

    public parameters: CheckUserAuthenticationFunction.Parameters;

    private logger: Logger;

    public constructor(data: any, private auth: AuthData | undefined) {
        this.logger = Logger.start(data.verbose, 'CheckUserAuthenticationFunction.constructor', { data, auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, this.logger.nextIndent);
        const parameterParser = new ParameterParser<CheckUserAuthenticationFunction.Parameters>(
            {
                fiatShamirParameters: ParameterBuilder.builder('object', FiatShamirParameters.fromObject),
                databaseType: ParameterBuilder.builder('string', DatabaseType.fromString),
                type: ParameterBuilder.guardBuilder('string', UserAuthenticationType.isValid)
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<CheckUserAuthenticationFunction.ReturnType> {
        this.logger.log('CheckUserAuthenticationFunction.executeFunction', {}, 'info');
        await checkPrerequirements(this.parameters, this.logger.nextIndent, this.auth);
        await checkUserAuthentication(this.auth, this.parameters.type, this.parameters.databaseType, this.logger.nextIndent);
    }
}

export namespace CheckUserAuthenticationFunction {
    export type Parameters = FirebaseFunction.DefaultParameters & {
        type: UserAuthenticationType
    }

    export type ReturnType = void;
    export type CallParameters = {
        type: UserAuthenticationType
    }
}
