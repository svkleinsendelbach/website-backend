import { type DatabaseType, type IFirebaseFunction, type ILogger, ParameterParser, type IFunctionType, IParameterContainer, IDatabaseReference, ValueParameterBuilder } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { recaptchaSecretKey } from '../privateKeys';
import fetch from 'cross-fetch';
import { DatabaseScheme } from '../DatabaseScheme';

export class VerifyRecaptchaFunction implements IFirebaseFunction<VerifyRecaptchaFunctionType> {
    public readonly parameters: IFunctionType.Parameters<VerifyRecaptchaFunctionType> & { databaseType: DatabaseType };

    public constructor(
        parameterContainer: IParameterContainer, 
        auth: AuthData | null, 
        databaseReference: IDatabaseReference<DatabaseScheme>, 
        private readonly logger: ILogger
    ) {
        this.logger.log('VerifyRecaptchaFunction.constructor', { auth: auth }, 'notice');
        const parameterParser = new ParameterParser<IFunctionType.Parameters<VerifyRecaptchaFunctionType>>(
            {
                token: new ValueParameterBuilder('string')
            },
            this.logger.nextIndent
        );
        parameterParser.parse(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async execute(): Promise<IFunctionType.ReturnType<VerifyRecaptchaFunctionType>> {
        this.logger.log('VerifyRecaptchaFunction.executeFunction', {}, 'info');
        const url = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecretKey}&response=${this.parameters.token}`;
        const result = await (await fetch(url)).json();
        return {
            ...result,
            errorCodes: result.errorCodes ?? null
        };
    }
}

export type VerifyRecaptchaFunctionType = IFunctionType<{
    token: string;
}, {
    success: boolean;
    score: number;
    action: string;
    challenge_ts: string;
    hostname: string;
    errorCodes: string[] | null;
}>;
