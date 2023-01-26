import { AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { News } from '../classes/News';
import { Crypter } from '../crypter/Crypter';
import { cryptionKeys } from '../privateKeys';
import { checkPrerequirements } from '../utils/checkPrerequirements';
import { DatabaseType } from '../classes/DatabaseType';
import { FirebaseFunction } from '../utils/FirebaseFunction';
import { Logger } from '../utils/Logger';
import { ParameterContainer } from '../utils/Parameter/ParameterContainer';
import { ParameterParser } from '../utils/Parameter/ParameterParser';
import { ParameterBuilder } from '../utils/Parameter/ParameterBuilder';
import { FirebaseDatabase } from '../utils/FirebaseDatabase';
import { FiatShamirParameters } from '../classes/FiatShamirParameters';

export class GetNewsFunction implements FirebaseFunction<
    GetNewsFunction.Parameters,
    GetNewsFunction.ReturnType
> {

    public parameters: GetNewsFunction.Parameters;

    private logger: Logger;

    public constructor(data: any, auth: AuthData | undefined) {
        this.logger = Logger.start(data.verbose, 'GetNewsFunction.constructor', { data, auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, this.logger.nextIndent);
        const parameterParser = new ParameterParser<GetNewsFunction.Parameters>(
            {
                fiatShamirParameters: ParameterBuilder.builder('object', FiatShamirParameters.fromObject),
                databaseType: ParameterBuilder.builder('string', DatabaseType.fromString),
                numberNews: ParameterBuilder.optionalBuilder(ParameterBuilder.trivialBuilder('number')),
                alsoDisabled: ParameterBuilder.optionalBuilder(ParameterBuilder.trivialBuilder('boolean'))
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<GetNewsFunction.ReturnType> {
        this.logger.log('GetNewsFunction.executeFunction', {}, 'info');
        await checkPrerequirements(this.parameters, this.logger.nextIndent, 'notRequired');
        const crypter = new Crypter(cryptionKeys(this.parameters.databaseType));
        const newsReference = FirebaseDatabase.Reference.fromPath('news', this.parameters.databaseType);
        const newsSnapshot = await newsReference.snapshot<string>();
        if (!newsSnapshot.exists || !newsSnapshot.hasChildren)
            return { news: [], hasMore: false };
        const allNews = Object
            .entries<string>(newsSnapshot.value)
            .compactMap<News.ReturnType>(entry => {
                const news: Omit<News, 'id'> = crypter.decryptDecode(entry[1]);
                if (!(this.parameters.alsoDisabled ?? false) && news.disabled) 
                    return undefined;
                return {
                    ...news,
                    date: new Date(news.date).toISOString(),
                    id: entry[0]
                };
            });
        allNews.sort((a, b) => (new Date(a.date) > new Date(b.date) ? -1 : 1));
        if (this.parameters.numberNews === undefined)
            return { news: allNews, hasMore: false };

        const newsToReturn: News.ReturnType[] = [];
        let hasMore = false;
        for (const news of allNews) {
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
        numberNews?: number
        alsoDisabled?: boolean
    }

    export interface ReturnType {
        news: News.ReturnType[],
        hasMore: boolean
    }
    
    export type CallParameters = {
        numberNews?: number
        alsoDisabled?: boolean
    }
}
