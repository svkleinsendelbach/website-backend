import { DatabaseType, IDatabaseReference, IFirebaseSchedule } from 'firebase-function';
import { DatabaseScheme } from '../DatabaseScheme';
import { Occupancy } from '../types/Occupancy';
import { EmbedBuilder } from 'discord.js';
import { Discord } from '../Discord';
import { OccupancyWeekDescription } from '../types/OccupancyWeekDescription';

export class OccupancyDiscordSchedule implements IFirebaseSchedule {
    public constructor(
        private readonly databaseType: DatabaseType,
        private readonly databaseReference: IDatabaseReference<DatabaseScheme>
    ) {}

    public async execute(): Promise<void> {
        const snapshot = await this.databaseReference.child('occupancies').snapshot();
        if (!snapshot.exists)
            return;
        const occupancyWeekDescription = new OccupancyWeekDescription(snapshot);
        const descriptions = occupancyWeekDescription.descriptions;
        const embeds: EmbedBuilder[] = [];
        for (const [location, description] of Object.entries(descriptions) as [Occupancy.Location, string][]) {
            const embed = new EmbedBuilder()
                .setTitle(Occupancy.Location.title[location])
                .setDescription(description)
                .setColor(Occupancy.Location.color[location]);
            embeds.push(embed);
        }
        await Discord.execute(this.databaseType, async discord => {
            await discord.add('occupancies', {
                content: `Woche ${occupancyWeekDescription.weekDescription}`,
                embeds: embeds
            });
        });
    }
}