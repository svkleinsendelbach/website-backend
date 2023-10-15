import { CategoryChannel, ChannelType, Client, Events, GatewayIntentBits, Message, MessageCreateOptions, MessageEditOptions, MessagePayload, OverwriteType, TextBasedChannel } from "discord.js";
import { discordKeys } from "./privateKeys";
import { DatabaseType } from "firebase-function";
import { Receiver } from "./functions/ContactFunction";

export class Discord {
    public constructor(
        private readonly client: Client
    ) {}

    public static execute(databaseType: DatabaseType, theFunction: (discord: Discord) => Promise<void>): Promise<void>;
    public static execute<R>(databaseType: DatabaseType, theFunction: (discord: Discord) => Promise<R>, testingDefault: R): Promise<R>;
    public static execute<R>(databaseType: DatabaseType, theFunction: (discord: Discord) => Promise<R>, testingDefault?: R): Promise<R> {
        if (databaseType.value !== 'release')
            return new Promise(resolve => resolve(testingDefault as R));
        return new Promise(resolve => {
            const client = new Client({
                intents: [GatewayIntentBits.Guilds]
            });
            client.once(Events.ClientReady, async client => {
                const discord = new Discord(client);
                resolve(await theFunction(discord));
                await client.destroy();
            });        
            client.login(discordKeys.botToken);
        });
    } 

    private async getChannel(id: string): Promise<TextBasedChannel | null> {
        try {
            const channel = await this.client.channels.fetch(id);
            if (!channel)
                return null;
            if (!channel.isTextBased())
                return null;
            return channel;
        } catch {
            return null;
        }
    }

    private async getMessage(channelId: string, id: string): Promise<Message | null> {
        const channel = await this.getChannel(channelId);
        if (!channel)
            return null;
        try {
            return await channel.messages.fetch(id);
        } catch {
            return null;
        }
    }

    public async add(channelId: string, content: string | MessagePayload | MessageCreateOptions): Promise<string | null> {
        const channel = await this.getChannel(channelId);
        if (!channel)
            return null;
        try {
            const message = await channel.send(content);
            return message.id;
        } catch {
            return null;
        }
    }

    public async change(channelId: string, messageId: string | null, content: string | MessagePayload | MessageEditOptions) {
        if (!messageId)
            return;
        const message = await this.getMessage(channelId, messageId);
        if (!message)
            return;
        try {
            await message.edit(content);
        } catch {}
    }

    public async remove(channelId: string, messageId: string | null) {
        if (!messageId)
            return;
        const message = await this.getMessage(channelId, messageId);
        if (!message)
            return;
        try {
            await message.delete();
        } catch {}
    }

    public async discordContact(userId: string, name: string, receiver: Receiver, content: string | MessagePayload | MessageCreateOptions) {
        const contactCategory = await this.client.channels.fetch(discordKeys.contactCategoryId) as CategoryChannel | null;
        if (!contactCategory)
            return;
        const channel = await contactCategory.children.create({
            name: `anfrage-von-${name.replaceAll(' ', '-')}`,
            permissionOverwrites: [{
                id: discordKeys.roleIds[receiver],
                type: OverwriteType.Role
            }, {
                id: userId,
                type: OverwriteType.Member
            }],
            type: ChannelType.GuildText
        });
        await channel.send(`${Receiver.description[receiver]} und ${name} ist dem Channel beigetreten.`);
        await channel.send(content);
    }
}
