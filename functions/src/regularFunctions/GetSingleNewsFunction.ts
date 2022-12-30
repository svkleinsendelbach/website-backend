import { AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { News } from '../classes/News';
import { Crypter } from '../crypter/Crypter';
import { cryptionKeys } from '../privateKeys';
import { checkPrerequirements } from '../utils/checkPrerequirements';
import { DatabaseType } from '../classes/DatabaseType';
import { FiatShamirParameters } from '../utils/fiatShamir';
import { FirebaseFunction } from '../utils/FirebaseFunction';
import { Logger } from '../utils/Logger';
import { ParameterContainer } from '../utils/Parameter/ParameterContainer';
import { ParameterParser } from '../utils/Parameter/ParameterParser';
import { httpsError } from '../utils/utils';
import { ParameterBuilder } from '../utils/Parameter/ParameterBuilder';
import { FirebaseDatabase } from '../utils/FirebaseDatabase';

export class GetSingleNewsFunction implements FirebaseFunction<
    GetSingleNewsFunction.Parameters,
    GetSingleNewsFunction.ReturnType
> {

    public parameters: GetSingleNewsFunction.Parameters;

    private logger: Logger;

    public constructor(data: any, auth: AuthData | undefined) {
        this.logger = Logger.start(!!data.verbose, 'GetSingleNewsFunction.constructor', { data, auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, this.logger.nextIndent);
        const parameterParser = new ParameterParser<GetSingleNewsFunction.Parameters>(
            {
                fiatShamirParameters: ParameterBuilder.builder('object', FiatShamirParameters.fromObject),
                databaseType: ParameterBuilder.builder('string', DatabaseType.fromString),
                newsId: ParameterBuilder.trivialBuilder('string')
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<GetSingleNewsFunction.ReturnType> {
        this.logger.log('GetSingleNewsFunction.executeFunction', {}, 'info');
        await checkPrerequirements(this.parameters, this.logger.nextIndent, 'notRequired');
        const crypter = new Crypter(cryptionKeys(this.parameters.databaseType));
        const newsReference = FirebaseDatabase.Reference.fromPath(`news/${this.parameters.newsId}`, this.parameters.databaseType);
        const newsSnapshot = await newsReference.snapshot<string>();
        if (!newsSnapshot.exists)
            throw httpsError('not-found', 'News with specified id not found.', this.logger);
        const news: Omit<News, 'id'> = crypter.decryptDecode(newsSnapshot.value);
        if (news.disabled)
            throw httpsError('unavailable', 'News with specified id is disabled.', this.logger);
        return {
            ...news,
            id: newsSnapshot.key! 
        };
    }
}

export namespace GetSingleNewsFunction {
    export type Parameters = FirebaseFunction.DefaultParameters & {
        newsId: string
    }

    export type ReturnType = News;
}
