import { type DatabaseType, type IFirebaseFunction, type ILogger, ParameterParser, type IFunctionType, IParameterContainer, IDatabaseReference, ValueParameterBuilder, HttpsError } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { DatabaseScheme } from '../DatabaseScheme';
import * as nodemailer from 'nodemailer';
import { Newsletter } from '../types/Newsletter';
import { checkUserRoles } from '../checkUserRoles';
import { Discord } from '../Discord';
import { discordKeys } from '../privateKeys';

export class NewsletterPublishFunction implements IFirebaseFunction<NewsletterPublishFunctionType> {
    public readonly parameters: IFunctionType.Parameters<NewsletterPublishFunctionType> & { databaseType: DatabaseType };

    private readonly transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'svkleinsendelbach.no.reply@gmail.com',
            pass: 'frsa tolw nflf qamx'
        }
    });

    public constructor(
        parameterContainer: IParameterContainer,
        private readonly auth: AuthData | null,
        private readonly databaseReference: IDatabaseReference<DatabaseScheme>,
        private readonly logger: ILogger
    ) {
        this.logger.log('NewsletterPublishFunction.constructor', { auth: auth }, 'notice');
        const parameterParser = new ParameterParser<IFunctionType.Parameters<NewsletterPublishFunctionType>>(
            {
                id: new ValueParameterBuilder('string'),
                html: new ValueParameterBuilder('string')
            },
            this.logger.nextIndent
        );
        parameterParser.parse(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async execute(): Promise<IFunctionType.ReturnType<NewsletterPublishFunctionType>> {
        this.logger.log('NewsletterPublishFunction.execute', {}, 'info');
        await checkUserRoles(this.auth, 'websiteManager', this.databaseReference, this.logger.nextIndent);
        const reference = this.databaseReference.child('newsletter').child(this.parameters.id);
        const snapshot = await reference.snapshot();
        if (!snapshot.exists)
            throw HttpsError('not-found', 'Newsletter does not exist', this.logger);
        const newsletter = Newsletter.concrete({
            ...snapshot.value('decrypt'),
            id: this.parameters.id
        });
        if (newsletter.alreadyPublished)
            throw HttpsError('already-exists', 'This newsletter is already published.', this.logger);
        await this.sendMailToAll(newsletter);
        await Discord.execute(this.parameters.databaseType, async discord => {
            await discord.add(discordKeys.channelIds.newsletter, Newsletter.discordMessage(newsletter));
        });
        await reference.set({
            ...snapshot.value('decrypt'),
            alreadyPublished: true
        }, 'encrypt');
    }

    private async sendMailToAll(newsletter: Newsletter) {
        const reference = this.databaseReference.child('newsletter-subscriptions');
        const snapshot = await reference.snapshot();
        if (!snapshot.hasChildren)
            return;
        const subscribers = snapshot.compactMap(snapshot => {
            if (snapshot.key === null)
                return null;
            return {
                address: snapshot.value('decrypt'),
                id: snapshot.key
            };
        });
        await Promise.all(subscribers.map(async subscriber => await this.sendMailToSingle(newsletter, subscriber)));
    }

    private async sendMailToSingle(newsletter: Newsletter, subscriber: { address: string; id: string }) {
        await this.transporter.sendMail({
            from: '"SV Kleinsendelbach e.V." <svkleinsendelbach.no.reply@gmail.com>',
            to: subscriber.address,
            subject: `SV Kleinsendelbach e.V. - Newsletter - ${Newsletter.Month.title[newsletter.titlePage.month]} ${newsletter.titlePage.year}`,
            text: Newsletter.plainText(newsletter, subscriber.id),
            html: this.parameters.html.replaceAll('%newsletter-subscriber-id%', subscriber.id),
        });
    }
}

export type NewsletterPublishFunctionType = IFunctionType<{
    id: string;
    html: string;
}, void>;
