import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, DatabaseReference, HttpsError } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkUserAuthentication } from '../checkUserAuthentication';
import { type DatabaseScheme } from '../DatabaseScheme';
import { getCryptionKeys, getDatabaseUrl } from '../privateKeys';

export class NewsDisableFunction implements FirebaseFunction<NewsDisableFunction.Parameters, NewsDisableFunction.ReturnType> {
    public readonly parameters: NewsDisableFunction.Parameters & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, private readonly auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('NewsDisableFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getCryptionKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<NewsDisableFunction.Parameters>(
            {
                editType: ParameterBuilder.guard('string', (value: string): value is 'disable' | 'enable' => value === 'disable' || value === 'enable'),
                newsId: ParameterBuilder.value('string')
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<NewsDisableFunction.ReturnType> {
        this.logger.log('NewsDisableFunction.executeFunction', {}, 'info');
        await checkUserAuthentication(this.auth, 'websiteEditing', this.parameters.databaseType, this.logger.nextIndent);
        const reference = DatabaseReference.base<DatabaseScheme>(getDatabaseUrl(this.parameters.databaseType), getCryptionKeys(this.parameters.databaseType)).child('news').child(this.parameters.newsId);
        const snapshot = await reference.snapshot();
        if (!snapshot.exists)
            throw HttpsError('not-found', 'Couldn\'t find news with specified id.', this.logger);
        const news = snapshot.value(true);
        news.disabled = this.parameters.editType === 'disable';
        await reference.set(news, true);
    }
}

export namespace NewsDisableFunction {
    export type Parameters = {
        editType: 'disable' | 'enable';
        newsId: string;
    };

    export type ReturnType = void;
}
