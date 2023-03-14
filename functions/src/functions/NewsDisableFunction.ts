import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, DatabaseReference, HttpsError, type FunctionType } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkUserAuthentication } from '../checkUserAuthentication';
import { type DatabaseScheme } from '../DatabaseScheme';
import { getPrivateKeys } from '../privateKeys';

export class NewsDisableFunction implements FirebaseFunction<NewsDisableFunctionType> {
    public readonly parameters: FunctionType.Parameters<NewsDisableFunctionType> & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, private readonly auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('NewsDisableFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getPrivateKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<FunctionType.Parameters<NewsDisableFunctionType>>(
            {
                editType: ParameterBuilder.guard('string', (value: string): value is 'disable' | 'enable' => value === 'disable' || value === 'enable'),
                newsId: ParameterBuilder.value('string')
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<NewsDisableFunctionType>> {
        this.logger.log('NewsDisableFunction.executeFunction', {}, 'info');
        await checkUserAuthentication(this.auth, 'editNews', this.parameters.databaseType, this.logger.nextIndent);
        const reference = DatabaseReference.base<DatabaseScheme>(getPrivateKeys(this.parameters.databaseType)).child('news').child(this.parameters.newsId);
        const snapshot = await reference.snapshot();
        if (!snapshot.exists)
            throw HttpsError('not-found', 'Couldn\'t find news with specified id.', this.logger);
        const news = snapshot.value('decrypt');
        news.disabled = this.parameters.editType === 'disable';
        await reference.set(news, 'encrypt');
    }
}

export type NewsDisableFunctionType = FunctionType<{
    editType: 'disable' | 'enable';
    newsId: string;
}, void>;
