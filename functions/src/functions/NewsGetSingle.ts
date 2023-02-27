import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, DatabaseReference, HttpsError, type FunctionType } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { type DatabaseScheme } from '../DatabaseScheme';
import { getCryptionKeys, getDatabaseUrl } from '../privateKeys';
import { type News } from '../types/News';

export class NewsGetSingleFunction implements FirebaseFunction<NewsGetSingleFunctionType> {
    public readonly parameters: FunctionType.Parameters<NewsGetSingleFunctionType> & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('NewsGetSingleFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getCryptionKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<FunctionType.Parameters<NewsGetSingleFunctionType>>(
            {
                newsId: ParameterBuilder.value('string')
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<NewsGetSingleFunctionType>> {
        this.logger.log('NewsGetSingleFunction.executeFunction', {}, 'info');
        const reference = DatabaseReference.base<DatabaseScheme>(getDatabaseUrl(this.parameters.databaseType), getCryptionKeys(this.parameters.databaseType)).child('news').child(this.parameters.newsId);
        const snapshot = await reference.snapshot();
        if (!snapshot.exists || snapshot.key === null)
            throw HttpsError('not-found', 'News with specified id not found.', this.logger);
        const news = snapshot.value(true);
        if (news.disabled)
            throw HttpsError('unavailable', 'News with specified id is disabled.', this.logger);
        return {
            ...news,
            id: snapshot.key
        };
    }
}

export type NewsGetSingleFunctionType = FunctionType<{
    newsId: string;
}, News.Flatten>;
