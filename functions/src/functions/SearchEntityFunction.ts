import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, type FunctionType, DatabaseReference } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { type DatabaseScheme } from '../DatabaseScheme';
import { getCryptionKeys, getDatabaseUrl } from '../privateKeys';
import { type Event } from '../types/Event';
import { type News } from '../types/News';
import { type Report } from '../types/Report';
import { type TypedSearchEntity, SearchEntityType } from '../types/SearchEntitiy';

export class SearchEntityFunction implements FirebaseFunction<SearchEntityFunctionType> {
    public readonly parameters: FunctionType.Parameters<SearchEntityFunctionType> & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('SearchEntityFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getCryptionKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<FunctionType.Parameters<SearchEntityFunctionType>>(
            {
                searchEntityTypes: ParameterBuilder.array(ParameterBuilder.guard('string', SearchEntityType.typeGuard)),
                searchText: ParameterBuilder.value('string')
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<SearchEntityFunctionType>> {
        this.logger.log('SearchEntityFunction.executeFunction', {}, 'info');
        const entities: Array<Promise<Array<TypedSearchEntity.Flatten<SearchEntityType>>>> = [];
        if (this.parameters.searchEntityTypes.includes('events'))
            entities.push(this.searchEvents());
        if (this.parameters.searchEntityTypes.includes('news'))
            entities.push(this.searchNews());
        if (this.parameters.searchEntityTypes.includes('reports'))
            entities.push(this.searchReports());
        return (await Promise.all(entities)).flatMap(entities => entities);
    }

    private async searchEvents(): Promise<Array<{ type: 'events'; value: Event.Flatten }>> {
        const reference = DatabaseReference.base<DatabaseScheme>(getDatabaseUrl(this.parameters.databaseType), getCryptionKeys(this.parameters.databaseType)).child('events');
        const snapshot = await reference.snapshot();
        return snapshot.flatMap(snapshot => {
            return snapshot.compactMap(snapshot => {
                if (snapshot.key === null)
                    return null;
                const event = snapshot.value(true);
                if (this.searchInStrings([event.title, event.subtitle]))
                    return {
                        type: 'events',
                        value: {
                            ...event,
                            id: snapshot.key
                        }
                    };
                return null;
            });
        });
    }

    private async searchNews(): Promise<Array<{ type: 'news'; value: News.Flatten }>> {
        const reference = DatabaseReference.base<DatabaseScheme>(getDatabaseUrl(this.parameters.databaseType), getCryptionKeys(this.parameters.databaseType)).child('news');
        const snapshot = await reference.snapshot();
        return snapshot.compactMap(snapshot => {
            if (snapshot.key === null)
                return null;
            const news = snapshot.value(true);
            if (news.disabled)
                return null;
            if (this.searchInStrings([news.title, news.subtitle, news.shortDescription]))
                return {
                    type: 'news',
                    value: {
                        ...news,
                        id: snapshot.key
                    }
                };
            return null;
        });
    }

    private async searchReports(): Promise<Array<{ type: 'reports'; value: Report.Flatten }>> {
        const reference = DatabaseReference.base<DatabaseScheme>(getDatabaseUrl(this.parameters.databaseType), getCryptionKeys(this.parameters.databaseType)).child('reports');
        const snapshot = await reference.snapshot();
        return snapshot.flatMap(snapshot => {
            return snapshot.compactMap(snapshot => {
                if (snapshot.key === null)
                    return null;
                const report = snapshot.value(true);
                if (this.searchInStrings([report.title, report.message]))
                    return {
                        type: 'reports',
                        value: {
                            ...report,
                            id: snapshot.key
                        }
                    };
                return null;
            });
        });
    }

    private searchInStrings(values: Array<string | undefined | null>): boolean {
        for (const value of values) {
            if (value === undefined || value === null)
                continue;
            if (value.search(this.parameters.searchText) !== -1)
                return true;
        }
        return false;
    }
}

export type SearchEntityFunctionType<T extends SearchEntityType = SearchEntityType> = FunctionType<{
    searchEntityTypes: T[];
    searchText: string;
}, Array<TypedSearchEntity.Flatten<T>>>;
