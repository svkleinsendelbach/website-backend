import { MockDatabaseReference } from "firebase-function/lib/src/testUtils";
import { DatabaseScheme } from "../src/DatabaseScheme";
import { OccupancyWeekDescription } from "../src/types/OccupancyWeekDescription";
import { expect } from "chai";
import { CryptedScheme, DatabaseType, UtcDate } from "firebase-function";
import { Occupancy } from "../src/types/Occupancy";
import { EmbedBuilder } from "discord.js";
import { Discord } from "../src/Discord";

describe('occupancyWeekDescription', () => {
    it('no occupancies', async () => {
        const reference = new MockDatabaseReference<DatabaseScheme['occupancies']>({});
        const snapshot = await reference.snapshot();
        const occupancyWeekDescription = new OccupancyWeekDescription(snapshot);
        expect(occupancyWeekDescription.descriptions).to.be.deep.equal({
            'sportshome': 'Keine Belegungen',
            'a-field': 'Keine Belegungen',
            'b-field': 'Keine Belegungen'
        });
    });

    it('filter and sort occupancies', async () => {
        const today = UtcDate.now.setted({ hour: 12, minute: 0 });
        const occupancies: Record<string, Omit<Occupancy, 'id'>> = {
            'a': {
                location: 'a-field',
                title: 'occupancy1',
                start: today,
                end: today.advanced({ hour: 1 }),
                recurring: null
            },
            'b': {
                location: 'a-field',
                title: 'occupancy2',
                start: today.advanced({ day: -8 }),
                end: today.advanced({ day: -8, hour: 1 }),
                recurring: null
            },
            'c': {
                location: 'a-field',
                title: 'occupancy3',
                start: today.advanced({ day: 8 }),
                end: today.advanced({ day: 8 }),
                recurring: null
            },
            'd': {
                location: 'a-field',
                title: 'occupancy4',
                start: today.advanced({ hour: -2 }),
                end: today.advanced({ hour: -1 }),
                recurring: null
            },
            'e': {
                location: 'b-field',
                title: 'occupancy5',
                start: today.advanced({ day: -7, hour: 2}),
                end: today.advanced({ day: -7, hour: 3 }),
                recurring: {
                    repeatEvery: 'week',
                    untilIncluding: today.setted({ hour: 0, minute: 0 }).advanced({ day: 7 }),
                    excludingDates: []
                }
            },
            'f': {
                location: 'b-field',
                title: 'occupancy5',
                start: today.advanced({ day: -7, hour: 2}),
                end: today.advanced({ day: -7, hour: 3 }),
                recurring: {
                    repeatEvery: 'week',
                    untilIncluding: today.setted({ hour: 0, minute: 0 }).advanced({ day: 7 }),
                    excludingDates: [today.setted({ hour: 0, minute: 0 })]
                }
            },
            'g': {
                location: 'sportshome',
                title: 'occupancy7',
                start: today,
                end: today.advanced({ hour: 1 }),
                recurring: null
            }
        };
        const reference = new MockDatabaseReference<DatabaseScheme['occupancies']>(MockDatabaseReference.createDatabaseScheme(encrypt => {
            const data: Record<string, CryptedScheme<Omit<Occupancy.Flatten, 'id'>>> = {};
            for (const [key, occupancy] of Object.entries(occupancies))
                data[key] = encrypt(Occupancy.flatten(occupancy));
            return data;
        }));
        const snapshot = await reference.snapshot();
        const occupancyWeekDescription = new OccupancyWeekDescription(snapshot);
        expect(occupancyWeekDescription.descriptions).to.be.deep.equal({
            'sportshome': `${occupancyWeekDescription.dateDescription(occupancies['g'])} | ${occupancies['g'].title}`,
            'a-field': `${occupancyWeekDescription.dateDescription(occupancies['d'])} | ${occupancies['d'].title}\n${occupancyWeekDescription.dateDescription(occupancies['a'])} | ${occupancies['a'].title}`,
            'b-field': `${occupancyWeekDescription.dateDescription({ ...occupancies['e'], start: occupancies['e'].start.advanced({ day: 7 }), end: occupancies['e'].end.advanced({ day: 7 }) })} | ${occupancies['e'].title}`
        });
    });

    it('collisions', async () => {
        const today = UtcDate.now.setted({ hour: 12, minute: 0 });
        const occupancies: Record<string, Omit<Occupancy, 'id'>> = {
            'a': {
                location: 'a-field',
                title: 'occupancy1',
                start: today.advanced({ hour: -3 }),
                end: today.advanced({ hour: 3 }),
                recurring: null
            },
            'b': {
                location: 'a-field',
                title: 'occupancy2',
                start: today.advanced({ hour: -1 }),
                end: today.advanced({ hour: 1 }),
                recurring: null
            },
            'c': {
                location: 'a-field',
                title: 'occupancy3',
                start: today.advanced({ hour: 1 }),
                end: today.advanced({ hour: 5 }),
                recurring: null
            },
            'd': {
                location: 'a-field',
                title: 'occupancy4',
                start: today.advanced({ hour: 4 }),
                end: today.advanced({ hour: 5 }),
                recurring: null
            }
        };
        const reference = new MockDatabaseReference<DatabaseScheme['occupancies']>(MockDatabaseReference.createDatabaseScheme(encrypt => {
            const data: Record<string, CryptedScheme<Omit<Occupancy.Flatten, 'id'>>> = {};
            for (const [key, occupancy] of Object.entries(occupancies))
                data[key] = encrypt(Occupancy.flatten(occupancy));
            return data;
        }));
        const snapshot = await reference.snapshot();
        const occupancyWeekDescription = new OccupancyWeekDescription(snapshot);
        expect(occupancyWeekDescription.descriptions).to.be.deep.equal({
            'sportshome': 'Keine Belegungen',
            'a-field': `${occupancyWeekDescription.dateDescription(occupancies['a'])} | ${occupancies['a'].title}\n${occupancyWeekDescription.dateDescription(occupancies['b'])} | ${occupancies['b'].title}\n${occupancyWeekDescription.dateDescription(occupancies['c'])} | ${occupancies['c'].title}\n${occupancyWeekDescription.dateDescription(occupancies['d'])} | ${occupancies['d'].title}\n\n\n` + 
                `Überschneidungen:\n${occupancyWeekDescription.dayDescription(occupancies['b'].start)} | ${occupancies['a'].title} - ${occupancies['b'].title}\n${occupancyWeekDescription.dayDescription(occupancies['c'].start)} | ${occupancies['a'].title} - ${occupancies['c'].title}\n${occupancyWeekDescription.dayDescription(occupancies['d'].start)} | ${occupancies['c'].title} - ${occupancies['d'].title}`,
            'b-field': 'Keine Belegungen'
        });


        const descriptions = occupancyWeekDescription.descriptions;
        const embeds: EmbedBuilder[] = [];
        for (const [location, description] of Object.entries(descriptions) as [Occupancy.Location, string][]) {
            const embed = new EmbedBuilder()
                .setTitle(Occupancy.Location.title[location])
                .setDescription(description)
                .setColor(Occupancy.Location.color[location]);
            embeds.push(embed);
        }
        await Discord.execute(new DatabaseType('release'), async discord => {
            await discord.add('occupancies', {
                content: `Woche ${occupancyWeekDescription.weekDescription}`,
                embeds: embeds
            });
        });
    });
});
