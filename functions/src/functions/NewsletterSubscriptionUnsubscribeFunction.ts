import { type DatabaseType, type IFirebaseFunction, type ILogger, ParameterParser, type IFunctionType, IParameterContainer, IDatabaseReference, NullableParameterBuilder, ValueParameterBuilder, sha512, HttpsError } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { DatabaseScheme } from '../DatabaseScheme';

export class NewsletterSubscriptionUnsubscribeFunction implements IFirebaseFunction<NewsletterSubscriptionUnsubscribeFunctionType> {
    public readonly parameters: IFunctionType.Parameters<NewsletterSubscriptionUnsubscribeFunctionType> & { databaseType: DatabaseType };

    public constructor(
        parameterContainer: IParameterContainer, 
        auth: AuthData | null, 
        private readonly databaseReference: IDatabaseReference<DatabaseScheme>, 
        private readonly logger: ILogger
    ) {
        this.logger.log('NewsletterSubscriptionUnsubscribeFunction.constructor', { auth: auth }, 'notice');
        const parameterParser = new ParameterParser<IFunctionType.Parameters<NewsletterSubscriptionUnsubscribeFunctionType>>(
            {
                id: new NullableParameterBuilder(new ValueParameterBuilder('string')),
                email: new NullableParameterBuilder(new ValueParameterBuilder('string'))
            },
            this.logger.nextIndent
        );
        parameterParser.parse(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async execute(): Promise<IFunctionType.ReturnType<NewsletterSubscriptionUnsubscribeFunctionType>> {
        this.logger.log('NewsletterSubscriptionUnsubscribeFunction.execute', {}, 'info');
        const subscriberId = this.parameters.id ?? (this.parameters.email !== null ? sha512(this.parameters.email).slice(0, 16) : null);
        if (subscriberId === null)
            throw HttpsError('invalid-argument', 'Id and email are null.', this.logger);
        const reference = this.databaseReference.child('newsletter-subscriptions').child(subscriberId);
        const snapshot = await reference.snapshot();
        if (!snapshot.exists)
            return;
        await reference.remove();
    }
}

export type NewsletterSubscriptionUnsubscribeFunctionType = IFunctionType<{
    id: string | null;
    email: string | null;
}, void>;
