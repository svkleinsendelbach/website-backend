import { Client, EmbedBuilder, Events, GatewayIntentBits, Message, TextBasedChannel } from "discord.js";
import { discordKeys } from "../privateKeys";
import { Event, EventGroupId } from "../types/Event";
import { Report, ReportGroupId } from "../types/Report";
import { DatabaseType, FunctionType } from "firebase-function";
import { CriticismSuggestion } from "../types/CriticismSuggestion";
import { Occupancy } from "../types/Occupancy";
import { SendMailContactFunctionType } from "../functions/SendMailContactFunction";

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

    public async addEvent(event: Omit<Event, 'id' | 'discordMessageId'>, groupId: EventGroupId): Promise<Omit<Event, 'id'>> {
        const channel = await this.getChannel('events');
        if (!channel)
            return Event.addDiscordMessageId(event, null);
        try {
            const message = await channel.send({
                embeds: [Event.discordEmbed(event, groupId)]
            });
            return Event.addDiscordMessageId(event, message.id);
        } catch {
            return Event.addDiscordMessageId(event, null);           
        }
    }

    public async changeEvent(event: Omit<Event, 'id'>, groupId: EventGroupId) {
        if (!event.discordMessageId)
            return;
        const message = await this.getMessage('events', event.discordMessageId);
        if (!message)
            return;
        try {
            await message.edit({
                embeds: [Event.discordEmbed(event, groupId)]
            });
        } catch {}
    }

    public async removeEvent(event: Omit<Event, 'id'>) {
        if (!event.discordMessageId)
            return;
        const message = await this.getMessage('events', event.discordMessageId);
        if (!message)
            return;
        try {
            await message.delete();
        } catch {}
    }

    public async addReport(report: Omit<Report, 'id' | 'discordMessageId'>, groupId: ReportGroupId): Promise<Omit<Report, 'id'>> {
        const channel = await this.getChannel('reports');
        if (!channel)
            return Report.addDiscordMessageId(report, null);
        try {
            const message = await channel.send({
                embeds: [Report.discordEmbed(report, groupId)]
            });
            return Report.addDiscordMessageId(report, message.id);
        } catch {
            return Report.addDiscordMessageId(report, null);           
        }
    }

    public async changeReport(report: Omit<Report, 'id'>, groupId: ReportGroupId) {
        if (!report.discordMessageId)
            return;
        const message = await this.getMessage('reports', report.discordMessageId);
        if (!message)
            return;
        try {
            await message.edit({
                embeds: [Report.discordEmbed(report, groupId)]
            });
        } catch {}
    }

    public async removeReport(report: Omit<Report, 'id'>) {
        if (!report.discordMessageId)
            return;
        const message = await this.getMessage('reports', report.discordMessageId);
        if (!message)
            return;
        try {
            await message.delete();
        } catch {}
    }

    public async addCriticismSuggestion(criticismSuggestion: Omit<CriticismSuggestion, 'id'>) {
        const channel = await this.getChannel('criticismSuggestions');
        if (!channel)
            return;
        try {
            await channel.send({
                embeds: [CriticismSuggestion.discordEmbed(criticismSuggestion)]
            });
        } catch {}
    }

    public async addOccupancy(occupancy: Omit<Occupancy, 'id' | 'discordMessageId'>): Promise<Omit<Occupancy, 'id'>> {
        const channel = await this.getChannel('occupancies');
        if (!channel)
            return Occupancy.addDiscordMessageId(occupancy, null);
        try {
            const message = await channel.send({
                embeds: [Occupancy.discordEmbed(occupancy)]
            });
            return Occupancy.addDiscordMessageId(occupancy, message.id);
        } catch {
            return Occupancy.addDiscordMessageId(occupancy, null);           
        }
    }

    public async changeOccupancy(occupancy: Omit<Occupancy, 'id'>) {
        if (!occupancy.discordMessageId)
            return;
        const message = await this.getMessage('occupancies', occupancy.discordMessageId);
        if (!message)
            return;
        try {
            await message.edit({
                embeds: [Occupancy.discordEmbed(occupancy)]
            });
        } catch {}
    }

    public async removeOccupancy(occupancy: Omit<Occupancy, 'id'>) {
        if (!occupancy.discordMessageId)
            return;
        const message = await this.getMessage('occupancies', occupancy.discordMessageId);
        if (!message)
            return;
        try {
            await message.delete();
        } catch {}
    }

    public async contactRequest(contact: FunctionType.Parameters<SendMailContactFunctionType>) {
        const channel = await this.getChannel('contactRequest');
        if (!channel)
            return;
        try {
            await channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`${contact.senderName} | ${contact.senderAddress}`)
                        .setDescription(`An: ${contact.receiverName}, ${contact.receiverAddress}\n\n${contact.message}`)
                ]
            });
        } catch {}
    }
}
