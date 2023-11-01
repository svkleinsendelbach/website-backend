import { type DatabaseType, type IFirebaseFunction, type ILogger, ParameterParser, type IFunctionType, IParameterContainer, IDatabaseReference, UtcDate } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { DatabaseScheme } from '../DatabaseScheme';
import { Newsletter } from '../types/Newsletter';

export class NewsletterGetAllFunction implements IFirebaseFunction<NewsletterGetAllFunctionType> {
    public readonly parameters: IFunctionType.Parameters<NewsletterGetAllFunctionType> & { databaseType: DatabaseType };

    public constructor(
        parameterContainer: IParameterContainer, 
        auth: AuthData | null, 
        private readonly databaseReference: IDatabaseReference<DatabaseScheme>, 
        private readonly logger: ILogger
    ) {
        this.logger.log('NewsletterGetAllFunction.constructor', { auth: auth }, 'notice');
        const parameterParser = new ParameterParser<IFunctionType.Parameters<NewsletterGetAllFunctionType>>({}, this.logger.nextIndent);
        parameterParser.parse(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async execute(): Promise<IFunctionType.ReturnType<NewsletterGetAllFunctionType>> {
        this.logger.log('NewsletterGetAllFunction.execute', {}, 'info');
        const reference = this.databaseReference.child('newsletter');
        const snapshot = await reference.snapshot();
        if (!snapshot.exists || !snapshot.hasChildren)
            return [];
        const newsletter = snapshot.compactMap(snapshot => {
            if (snapshot.key === null)
                return null;
            const newsletter = snapshot.value('decrypt');
            return {
                id: snapshot.key,
                date: newsletter.date,
                ...newsletter.titlePage
            };
        });
        newsletter.sort((a, b) => UtcDate.decode(a.date).compare(UtcDate.decode(b.date)) === 'greater' ? -1 : 1);
        return newsletter;
    }
}

export type NewsletterGetAllFunctionType = IFunctionType<Record<string, never>, {
    id: string;
    date: string;
    title: string;
    description: string;
    imageSrc: string;
    month: Newsletter.Month;
    year: number;
}[]>;
