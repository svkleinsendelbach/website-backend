import { Client, EmbedBuilder, Events, GatewayIntentBits, Message, TextBasedChannel } from "discord.js";
import { discordKeys } from "./privateKeys";
import { DatabaseType } from "firebase-function";

export class Discord {
    public constructor(
        private readonly client: Client
    ) {}

    public static execute(databaseType: DatabaseType, theFunction: (discord: Discord) => Promise<void>): Promise<void>;
    public static execute<R>(databaseType: DatabaseType, theFunction: (discord: Discord) => Promise<R>, testingDefault: R): Promise<R>;
    public static execute<R>(databaseType: DatabaseType, theFunction: (discord: Discord) => Promise<R>, testingDefault?: R): Promise<R> {
        if (databaseType.value === 'debug' || databaseType.value === 'testing')
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

    private async getChannel(type: keyof typeof discordKeys.channelIds): Promise<TextBasedChannel | null> {
        try {
            const channel = await this.client.channels.fetch(discordKeys.channelIds[type]);
            if (!channel)
                return null;
            if (!channel.isTextBased())
                return null;
            return channel;
        } catch {
            return null;
        }
    }

    private async getMessage(channelType: keyof typeof discordKeys.channelIds, id: string): Promise<Message | null> {
        const channel = await this.getChannel(channelType);
        if (!channel)
            return null;
        try {
            return await channel.messages.fetch(id);
        } catch {
            return null;
        }
    }

    public async add(channelType: keyof typeof discordKeys.channelIds, embed: EmbedBuilder): Promise<string | null> {
        const channel = await this.getChannel(channelType);
        if (!channel)
            return null;
        try {
            const message = await channel.send({
                embeds: [embed]
            });
            return message.id;
        } catch {
            return null;
        }
    }

    public async change(channelType: keyof typeof discordKeys.channelIds, messageId: string | null, embed: EmbedBuilder) {
        if (!messageId)
            return;
        const message = await this.getMessage(channelType, messageId);
        if (!message)
            return;
        try {
            await message.edit({
                embeds: [embed]
            });
        } catch {}
    }

    public async remove(channelType: keyof typeof discordKeys.channelIds, messageId: string | null) {
        if (!messageId)
            return;
        const message = await this.getMessage(channelType, messageId);
        if (!message)
            return;
        try {
            await message.delete();
        } catch {}
    }
}
