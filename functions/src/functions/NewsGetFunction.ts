import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, DatabaseReference } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { type DatabaseScheme } from '../DatabaseScheme';
import { getCryptionKeys, getDatabaseUrl } from '../privateKeys';
import { type News } from '../types/News';

export class NewsGetFunction implements FirebaseFunction<NewsGetFunction.Parameters, NewsGetFunction.ReturnType> {
    public readonly parameters: NewsGetFunction.Parameters & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('NewsGetFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getCryptionKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<NewsGetFunction.Parameters>(
            {
                numberNews: ParameterBuilder.optional(ParameterBuilder.value('number')),
                alsoDisabled: ParameterBuilder.value('boolean')
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<NewsGetFunction.ReturnType> {
        this.logger.log('NewsGetFunction.executeFunction', {}, 'info');
        const reference = DatabaseReference.base<DatabaseScheme>(getDatabaseUrl(this.parameters.databaseType), getCryptionKeys(this.parameters.databaseType)).child('news');
        const snapshot = await reference.snapshot();
        if (!snapshot.exists || !snapshot.hasChildren)
            return { news: [], hasMore: false };
        const allNews = snapshot.compactMap<News.Flatten>(snapshot => {
            if (snapshot.key === null)
                return undefined;
            const news = snapshot.value(true);
            if (!this.parameters.alsoDisabled && Boolean(news.disabled))
                return undefined;
            return {
                ...news,
                id: snapshot.key
            };
        });
        allNews.sort((a, b) => new Date(a.date) > new Date(b.date) ? -1 : 1);
        if (this.parameters.numberNews === undefined)
            return { news: allNews, hasMore: false };
        const newsToReturn: News.Flatten[] = [];
        let hasMore = false;
        for (const news of allNews) {
            if (newsToReturn.length === this.parameters.numberNews) {
                hasMore = true;
                break;
            }
            newsToReturn.push(news);
        }
        return { news: newsToReturn, hasMore: hasMore };
    }
}

export namespace NewsGetFunction {
    export type Parameters = {
        numberNews: number | undefined;
        alsoDisabled: boolean;
    };

    export type ReturnType = {
        news: News.Flatten[];
        hasMore: boolean;
    };
}
