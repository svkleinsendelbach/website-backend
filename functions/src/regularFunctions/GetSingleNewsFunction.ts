import { AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { News } from '../classes/News';
import { Crypter } from '../crypter/Crypter';
import { cryptionKeys } from '../privateKeys';
import { checkPrerequirements } from '../utils/checkPrerequirements';
import { DatabaseType } from '../utils/DatabaseType';
import { FiatShamirParameters } from '../utils/fiatShamir';
import { FirebaseFunction } from '../utils/FirebaseFunction';
import { Logger } from '../utils/Logger';
import { ParameterContainer } from '../utils/ParameterContainer';
import { ParameterParser } from '../utils/ParameterParser';
import { httpsError, reference } from '../utils/utils';

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
                fiatShamirParameters: ['object', FiatShamirParameters.fromObject],
                databaseType: ['string', DatabaseType.fromString],
                newsId: 'string'
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<GetSingleNewsFunction.ReturnType> {
        this.logger.append('GetSingleNewsFunction.executeFunction', {}, 'info');
        await checkPrerequirements(this.parameters, this.logger.nextIndent, 'notRequired');
        const crypter = new Crypter(cryptionKeys(this.parameters.databaseType));
        const newsRef = reference(`news/${this.parameters.newsId}`, this.parameters.databaseType, this.logger.nextIndent);
        const newsSnapshot = await newsRef.once('value');
        if (!newsSnapshot.exists())
            throw httpsError('not-found', 'News with specified id not found.', this.logger);
        const news: Omit<News, 'id'> = crypter.decryptDecode(newsSnapshot.val());
        if (news.disabled)
            throw httpsError('unavailable', 'News with specified id is disabled.', this.logger);
        return {
            ...news,
            id: newsSnapshot.key! 
        };
    }
}

export namespace GetSingleNewsFunction {
    export interface Parameters {
        fiatShamirParameters: FiatShamirParameters
        databaseType: DatabaseType
        newsId: string
    }

    export type ReturnType = News;
}
