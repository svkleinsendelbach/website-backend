import { type DatabaseType, type IFirebaseFunction, type ILogger, ParameterParser, type IFunctionType, IParameterContainer, IDatabaseReference, ValueParameterBuilder, sha512 } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { DatabaseScheme } from '../DatabaseScheme';

export class NewsletterSubscriptionSubscribeFunction implements IFirebaseFunction<NewsletterSubscriptionSubscribeFunctionType> {
    public readonly parameters: IFunctionType.Parameters<NewsletterSubscriptionSubscribeFunctionType> & { databaseType: DatabaseType };

    public constructor(
        parameterContainer: IParameterContainer, 
        auth: AuthData | null, 
        private readonly databaseReference: IDatabaseReference<DatabaseScheme>, 
        private readonly logger: ILogger
    ) {
        this.logger.log('NewsletterSubscriptionSubscribeFunction.constructor', { auth: auth }, 'notice');
        const parameterParser = new ParameterParser<IFunctionType.Parameters<NewsletterSubscriptionSubscribeFunctionType>>(
            {
                email: new ValueParameterBuilder('string')
            },
            this.logger.nextIndent
        );
        parameterParser.parse(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async execute(): Promise<IFunctionType.ReturnType<NewsletterSubscriptionSubscribeFunctionType>> {
        this.logger.log('NewsletterSubscriptionSubscribeFunction.execute', {}, 'info');
        const subscriberId = sha512(this.parameters.email).slice(0, 16);
        const reference = this.databaseReference.child('newsletter-subscriptions').child(subscriberId);
        const snapshot = await reference.snapshot();
        if (snapshot.exists)
            return;
        await reference.set(this.parameters.email, 'encrypt');
    }
}

export type NewsletterSubscriptionSubscribeFunctionType = IFunctionType<{
    email: string;
}, void>;
