import fetch from 'cross-fetch';

import { AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { recaptchaSecretKeys } from '../privateKeys';
import { checkPrerequirements } from '../utils/checkPrerequirements';
import { DatabaseType } from '../utils/DatabaseType';
import { FirebaseFunction } from '../utils/FirebaseFunction';
import { Logger } from '../utils/Logger';
import { ParameterContainer } from '../utils/ParameterContainer';
import { ParameterParser } from '../utils/ParameterParser';
import { httpsError } from '../utils/utils';

export class VerifyRecaptchaFunction implements FirebaseFunction<
    VerifyRecaptchaFunction.Parameters,
    VerifyRecaptchaFunction.ReturnType
> {

    public parameters: VerifyRecaptchaFunction.Parameters;

    private logger: Logger;

    public constructor(data: any, auth: AuthData | undefined) {
        this.logger = Logger.start(!!data.verbose, 'VerifyRecaptchaFunction.constructor', { data, auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, this.logger.nextIndent);
        const parameterParser = new ParameterParser<VerifyRecaptchaFunction.Parameters>(
            {
                privateKey: 'string',
                databaseType: ['string', DatabaseType.fromString],
                actionType: ['string', (value: string, logger: Logger): 'contactForm' => {
                    if (value !== 'contactForm')
                        throw httpsError('invalid-argument', `Invalid action type: ${value}`, logger);
                    return value;
                }],
                token: 'string'
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<VerifyRecaptchaFunction.ReturnType> {
        this.logger.append('VerifyRecaptchaFunction.executeFunction', {}, 'info');
        await checkPrerequirements(this.parameters, this.logger.nextIndent, 'notRequired');
        const url = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecretKeys[this.parameters.actionType]}&response=${this.parameters.token}`;
        return await (await fetch(url)).json();
    }
}

export namespace VerifyRecaptchaFunction {
    export interface Parameters {
        privateKey: string
        databaseType: DatabaseType
        actionType: 'contactForm',
        token: string
    }

    export type ReturnType = VerifyRecaptchaFunction.VerifyResponse;

    export interface VerifyResponse {
      success: boolean;
      challenge_ts: string;
      hostname: string;
      errorCodes?: string[];
    }
}
