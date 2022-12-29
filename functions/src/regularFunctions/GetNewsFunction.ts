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
import { reference } from '../utils/utils';

export class GetNewsFunction implements FirebaseFunction<
    GetNewsFunction.Parameters,
    GetNewsFunction.ReturnType
> {

    public parameters: GetNewsFunction.Parameters;

    private logger: Logger;

    public constructor(data: any, auth: AuthData | undefined) {
        this.logger = Logger.start(!!data.verbose, 'GetNewsFunction.constructor', { data, auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, this.logger.nextIndent);
        const parameterParser = new ParameterParser<GetNewsFunction.Parameters>(
            {
                fiatShamirParameters: ['object', FiatShamirParameters.fromObject],
                databaseType: ['string', DatabaseType.fromString],
                numberNews: 'number'
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<GetNewsFunction.ReturnType> {
        this.logger.append('GetNewsFunction.executeFunction', {}, 'info');
        await checkPrerequirements(this.parameters, this.logger.nextIndent, 'notRequired');
        const crypter = new Crypter(cryptionKeys(this.parameters.databaseType));
        const newsRef = reference('news', this.parameters.databaseType, this.logger.nextIndent);
        const newsSnapshot = await newsRef.once('value');
        if (!newsSnapshot.exists() || !newsSnapshot.hasChildren())
            return { news: [], hasMore: false };
        const allNews = Object
            .entries<string>(newsSnapshot.val())
            .compactMap<News>(entry => {
                const news: Omit<News, 'id'> = crypter.decryptDecode(entry[1]);
                return {
                    ...news,
                    id: entry[0]
                };
            });
        allNews.sort((a, b) => (new Date(a.date) > new Date(b.date) ? -1 : 1));
        if (this.parameters.numberNews === undefined)
            return { news: allNews, hasMore: false };

        const newsToReturn: News[] = [];
        let hasMore = false;
        for (const news of allNews) {
            if (news.disabled) continue;
            if (newsToReturn.length === this.parameters.numberNews) {
                hasMore = true; 
                break;
            } else
                newsToReturn.push(news);
        }
        return { news: newsToReturn, hasMore: hasMore };
    }
}

export namespace GetNewsFunction {
    export type Parameters = FirebaseFunction.DefaultParameters & {
        numberNews: number
    }

    export interface ReturnType {
        news: News[],
        hasMore: boolean
    }
}
