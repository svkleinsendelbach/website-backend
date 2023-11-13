import { type DatabaseType, type ILogger, ParameterBuilder, ParameterParser, type IFunctionType, IParameterContainer, IDatabaseReference, GuardParameterBuilder, ValueParameterBuilder, NullableParameterBuilder, IFirebaseFunction, CryptedScheme, HttpsError } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { EditType } from '../types/EditType';
import { Newsletter } from '../types/Newsletter';
import { DatabaseScheme } from '../DatabaseScheme';
import { checkUserRoles } from '../checkUserRoles';

export class NewsletterEditFunction implements IFirebaseFunction<NewsletterEditFunctionType> {
    public readonly parameters: IFunctionType.Parameters<NewsletterEditFunctionType> & { databaseType: DatabaseType };

    public constructor(
        parameterContainer: IParameterContainer, 
        private readonly auth: AuthData | null, 
        private readonly databaseReference: IDatabaseReference<DatabaseScheme>, 
        private readonly logger: ILogger
    ) {
        this.logger.log('NewsletterEditFunction.constructor', { auth: auth }, 'notice');
        const parameterParser = new ParameterParser<IFunctionType.Parameters<NewsletterEditFunctionType>>(
            {
                editType: new GuardParameterBuilder('string', EditType.typeGuard),
                newsletterId: new ValueParameterBuilder('string'),
                newsletter: new NullableParameterBuilder(new ParameterBuilder('object', Newsletter.fromObject))
            },
            this.logger.nextIndent
        );
        parameterParser.parse(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async execute(): Promise<IFunctionType.ReturnType<NewsletterEditFunctionType>> {
        this.logger.log('NewsletterEditFunction.execute', {}, 'info');
        await checkUserRoles(this.auth, 'websiteManager', this.databaseReference, this.logger);
        switch (this.parameters.editType) {
            case 'add':
                return await this.addNewsletter();
            case 'change':
                return await this.changeNewsletter();
            case 'remove':
                return await this.removeNewsletter();
        }
    }

    private get reference(): IDatabaseReference<CryptedScheme<Omit<Newsletter.Flatten, 'id'>>> {
        return this.databaseReference.child('newsletter').child(this.parameters.newsletterId);
    }

    private async getDatabaseNewsletter(): Promise<Omit<Newsletter, 'id'> | null> {
        const snapshot = await this.reference.snapshot();
        if (!snapshot.exists)
            return null;
        return Newsletter.concrete(snapshot.value('decrypt'));
    }

    private async addNewsletter() {
        if (!this.parameters.newsletter)
            throw HttpsError('invalid-argument', 'No newsletter in parameters to add.', this.logger);
        const databaseNewsletter = await this.getDatabaseNewsletter();
        if (databaseNewsletter)
            throw HttpsError('invalid-argument', 'Couldn\'t add existing newsletter.', this.logger);
        const newsletter = this.parameters.newsletter;
        await this.reference.set(Newsletter.flatten(newsletter), 'encrypt');
    }

    private async changeNewsletter() {
        if (!this.parameters.newsletter)
            throw HttpsError('invalid-argument', 'No newsletter in parameters to change.', this.logger);
        const databaseNewsletter = await this.getDatabaseNewsletter();
        if (!databaseNewsletter)
            throw HttpsError('invalid-argument', 'Couldn\'t change not existing newsletter.', this.logger);
        await this.reference.set(Newsletter.flatten(this.parameters.newsletter), 'encrypt');
    }

    private async removeNewsletter() {
        const databaseEvent = await this.getDatabaseNewsletter();
        if (!databaseEvent)
            return;
        await this.reference.remove();
    }
}

export type NewsletterEditFunctionType = IFunctionType<{
    editType: EditType;
    newsletterId: string;
    newsletter: Omit<Newsletter, 'id'> | null;
}, void, {
    editType: EditType;
    newsletterId: string;
    newsletter: Omit<Newsletter.Flatten, 'id'> | null;
}>;
