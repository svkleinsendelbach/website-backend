import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { getCryptionKeys, recaptchaSecretKey } from '../privateKeys';
import fetch from 'cross-fetch';

export class VerifyRecaptchaFunction implements FirebaseFunction<VerifyRecaptchaFunction.Parameters, VerifyRecaptchaFunction.ReturnType> {
    public readonly parameters: VerifyRecaptchaFunction.Parameters & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('VerifyRecaptchaFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getCryptionKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<VerifyRecaptchaFunction.Parameters>(
            {
                token: ParameterBuilder.value('string')
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<VerifyRecaptchaFunction.ReturnType> {
        this.logger.log('VerifyRecaptchaFunction.executeFunction', {}, 'info');
        const url = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecretKey}&response=${this.parameters.token}`;
        return await (await fetch(url)).json();
    }
}

export namespace VerifyRecaptchaFunction {
    export type Parameters = {
        token: string;
    };

    export type ReturnType = {
        success: boolean;
        score: number;
        action: string;
        challenge_ts: string;
        hostname: string;
        errorCodes?: string[];
    };
}
