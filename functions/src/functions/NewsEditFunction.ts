import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, DatabaseReference, HttpsError, type FunctionType } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkUserAuthentication } from '../checkUserAuthentication';
import { type DatabaseScheme } from '../DatabaseScheme';
import { getCryptionKeys, getDatabaseUrl } from '../privateKeys';
import { EditType } from '../types/EditType';
import { News } from '../types/News';

export class NewsEditFunction implements FirebaseFunction<NewsEditFunctionType> {
    public readonly parameters: FunctionType.Parameters<NewsEditFunctionType> & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, private readonly auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('NewsEditFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getCryptionKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<FunctionType.Parameters<NewsEditFunctionType>>(
            {
                editType: ParameterBuilder.guard('string', EditType.typeGuard),
                newsId: ParameterBuilder.value('string'),
                news: ParameterBuilder.optional(ParameterBuilder.build('object', News.fromObject))
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<NewsEditFunctionType>> {
        this.logger.log('NewsEditFunction.executeFunction', {}, 'info');
        await checkUserAuthentication(this.auth, 'websiteEditing', this.parameters.databaseType, this.logger);
        const newsId = await this.getNewsId();
        const reference = DatabaseReference.base<DatabaseScheme>(getDatabaseUrl(this.parameters.databaseType), getCryptionKeys(this.parameters.databaseType)).child('news').child(newsId);
        const snapshot = await reference.snapshot();
        if (this.parameters.editType === 'remove') {
            if (snapshot.exists)
                await reference.remove();
        } else {
            if (this.parameters.news === undefined)
                throw HttpsError('invalid-argument', 'No news in parameters to add / change.', this.logger);
            if (this.parameters.editType === 'change' && !snapshot.exists)
                throw HttpsError('invalid-argument', 'Couldn\'t change not existing news.', this.logger);
            await reference.set(News.flatten(this.parameters.news), true);
        }
        return newsId;
    }

    private async getNewsId(): Promise<string> {
        this.logger.log('NewsEditFunction.getIdOfNews');
        if (this.parameters.editType !== 'add')
            return this.parameters.newsId;
        const reference = DatabaseReference.base<DatabaseScheme>(getDatabaseUrl(this.parameters.databaseType), getCryptionKeys(this.parameters.databaseType)).child('news');
        const snapshot = await reference.snapshot();
        const alreadyUsedIds: ['unused' | 'used', ...number[]] = ['unused'];
        snapshot.forEach(snapshot => {
            if (snapshot.key === null)
                return;
            if (snapshot.key === this.parameters.newsId) {
                alreadyUsedIds[0] = 'used';
                return;
            }
            const regex = new RegExp(`^${this.parameters.newsId}_(?<i>\\d+)$`);
            const i = regex.exec(snapshot.key)?.groups?.i;
            if (i !== undefined)
                alreadyUsedIds.push(Number.parseInt(i));
        });
        const suffix = this.getIdSuffix(alreadyUsedIds);
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        return this.parameters.newsId + suffix;
    }

    private getIdSuffix(alreadyUsedIds: ['unused' | 'used', ...number[]]): string {
        if (alreadyUsedIds[0] === 'unused')
            return '';
        let index = 2;
        while (true) {
            if (!alreadyUsedIds.slice(1).includes(index))
                return `_${index}`;
            index += 1;
        }
    }
}

export type NewsEditFunctionType = FunctionType<{
    editType: EditType;
    newsId: string;
    news: Omit<News, 'id'> | undefined;
}, string, {
    editType: EditType;
    newsId: string;
    news: Omit<News.Flatten, 'id'> | undefined;
}>;
