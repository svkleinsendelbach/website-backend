import { type DatabaseType, type ILogger, ParameterBuilder, ParameterParser, type IFunctionType, IParameterContainer, IDatabaseReference, GuardParameterBuilder, ValueParameterBuilder, NullableParameterBuilder, IFirebaseFunction, CryptedScheme, HttpsError } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { EditType } from '../types/EditType';
import { Newsletter } from '../types/Newsletter';
import { DatabaseScheme } from '../DatabaseScheme';
import { checkUserRoles } from '../checkUserRoles';
import { Discord } from '../Discord';
import { discordKeys } from '../privateKeys';

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
        const discordMessageId = await Discord.execute(this.parameters.databaseType, async discord => {
            return await discord.add(discordKeys.channelIds.newsletter, { embeds: [Newsletter.discordEmbed(this.parameters.newsletterId, newsletter)] });
        }, null);
        await this.reference.set(Newsletter.flatten(Newsletter.addDiscordMessageId(newsletter, discordMessageId)), 'encrypt');
    }

    private async changeNewsletter() {
        if (!this.parameters.newsletter)
            throw HttpsError('invalid-argument', 'No newsletter in parameters to change.', this.logger);
        const databaseNewsletter = await this.getDatabaseNewsletter();
        if (!databaseNewsletter)
            throw HttpsError('invalid-argument', 'Couldn\'t change not existing newsletter.', this.logger);
        const newsletter = Newsletter.addDiscordMessageId(this.parameters.newsletter, databaseNewsletter.discordMessageId);
        void Discord.execute(this.parameters.databaseType, async discord => {
            await discord.change(discordKeys.channelIds.newsletter, newsletter.discordMessageId, { embeds: [Newsletter.discordEmbed(this.parameters.newsletterId, newsletter)] });
        });
        await this.reference.set(Newsletter.flatten(newsletter), 'encrypt');
    }

    private async removeNewsletter() {
        const databaseEvent = await this.getDatabaseNewsletter();
        if (!databaseEvent)
            return;
        void Discord.execute(this.parameters.databaseType, async discord => {
            await discord.remove(discordKeys.channelIds.newsletter, databaseEvent.discordMessageId);
        });
        await this.reference.remove();
    }
}

export type NewsletterEditFunctionType = IFunctionType<{
    editType: EditType;
    newsletterId: string;
    newsletter: Omit<Newsletter, 'id' | 'discordMessageId'> | null;
}, void, {
    editType: EditType;
    newsletterId: string;
    newsletter: Omit<Newsletter.Flatten, 'id' | 'discordMessageId'> | null;
}>;
