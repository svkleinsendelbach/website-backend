import { type DatabaseType, type IFirebaseFunction, type ILogger, ParameterParser, type IFunctionType, IParameterContainer, IDatabaseReference, ValueParameterBuilder } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { DatabaseScheme } from '../DatabaseScheme';
import { Newsletter } from '../types/Newsletter';

export class NewsletterGetFunction implements IFirebaseFunction<NewsletterGetFunctionType> {
    public readonly parameters: IFunctionType.Parameters<NewsletterGetFunctionType> & { databaseType: DatabaseType };

    public constructor(
        parameterContainer: IParameterContainer, 
        auth: AuthData | null, 
        private readonly databaseReference: IDatabaseReference<DatabaseScheme>, 
        private readonly logger: ILogger
    ) {
        this.logger.log('NewsletterGetFunction.constructor', { auth: auth }, 'notice');
        const parameterParser = new ParameterParser<IFunctionType.Parameters<NewsletterGetFunctionType>>(
            {
                id: new ValueParameterBuilder('string')
            },
            this.logger.nextIndent
        );
        parameterParser.parse(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async execute(): Promise<IFunctionType.ReturnType<NewsletterGetFunctionType>> {
        this.logger.log('NewsletterGetFunction.execute', {}, 'info');
        const reference = this.databaseReference.child('newsletter').child(this.parameters.id);
        const snapshot = await reference.snapshot();
        if (!snapshot.exists)
            return null;
        return {
            ...snapshot.value('decrypt'),
            id: this.parameters.id
        };
    }
}

export type NewsletterGetFunctionType = IFunctionType<{
    id: string;
}, Newsletter.Flatten | null>;
