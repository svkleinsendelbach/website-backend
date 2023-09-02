import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, type FunctionType } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { getPrivateKeys, recaptchaSecretKey } from '../privateKeys';
import fetch from 'cross-fetch';

export class VerifyRecaptchaFunction implements FirebaseFunction<VerifyRecaptchaFunctionType> {
    public readonly parameters: FunctionType.Parameters<VerifyRecaptchaFunctionType> & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('VerifyRecaptchaFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getPrivateKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<FunctionType.Parameters<VerifyRecaptchaFunctionType>>(
            {
                token: ParameterBuilder.value('string')
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<VerifyRecaptchaFunctionType>> {
        this.logger.log('VerifyRecaptchaFunction.executeFunction', {}, 'info');
        const url = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecretKey}&response=${this.parameters.token}`;
        const result = await (await fetch(url)).json();
        return {
            ...result,
            errorCodes: result.errorCodes ?? null
        };
    }
}

export type VerifyRecaptchaFunctionType = FunctionType<{
    token: string;
}, {
    success: boolean;
    score: number;
    action: string;
    challenge_ts: string;
    hostname: string;
    errorCodes: string[] | null;
}>;
