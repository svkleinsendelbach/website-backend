import { type DatabaseType, type IFirebaseFunction, type ILogger, ParameterParser, type IFunctionType, IParameterContainer, IDatabaseReference } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { DatabaseScheme } from '../DatabaseScheme';
import { checkUserRoles } from '../checkUserRoles';

export class NewsletterSubscriptionGetAllFunction implements IFirebaseFunction<NewsletterSubscriptionGetAllFunctionType> {
    public readonly parameters: IFunctionType.Parameters<NewsletterSubscriptionGetAllFunctionType> & { databaseType: DatabaseType };

    public constructor(
        parameterContainer: IParameterContainer, 
        private readonly auth: AuthData | null, 
        private readonly databaseReference: IDatabaseReference<DatabaseScheme>, 
        private readonly logger: ILogger
    ) {
        this.logger.log('NewsletterSubscriptionGetAllFunction.constructor', { auth: auth }, 'notice');
        const parameterParser = new ParameterParser<IFunctionType.Parameters<NewsletterSubscriptionGetAllFunctionType>>({}, this.logger.nextIndent);
        parameterParser.parse(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async execute(): Promise<IFunctionType.ReturnType<NewsletterSubscriptionGetAllFunctionType>> {
        this.logger.log('NewsletterSubscriptionGetAllFunction.execute', {}, 'info');
        await checkUserRoles(this.auth, 'websiteManager', this.databaseReference, this.logger);
        const reference = this.databaseReference.child('newsletter-subscriptions');
        const snapshot = await reference.snapshot();
        if (!snapshot.exists || !snapshot.hasChildren)
            return [];
        return snapshot.compactMap(snapshot => {
            if (snapshot.key === null)
                return null;
            return {
                id: snapshot.key, 
                email: snapshot.value('decrypt')
            };
        });
    }
}

export type NewsletterSubscriptionGetAllFunctionType = IFunctionType<Record<string, never>, {
    id: string;
    email: string;
}[]>;
