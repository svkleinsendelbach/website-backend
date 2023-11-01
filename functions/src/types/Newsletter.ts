import { HttpsError, ILogger, UtcDate } from "firebase-function";
import { EventGroupId } from "./Event";
import { mapRecord } from "../utils/record-array";
import { EmbedBuilder } from "discord.js";

export type Newsletter = {
    id: string;
    date: UtcDate;
    discordMessageId: string | null;
    titlePage: {
        title: string;
        description: string;
        imageSrc: string;
        month: Newsletter.Month;
        year: number;
    };
    departments: {
        [Department in Newsletter.Department]: {
            title: string;
            description: string;
        }[] | null
    };
    events: {
        [GroupId in EventGroupId]: {
            date: UtcDate;
            title: string;
            subtitle: string | null;
        }[] | null;
    };
};

export namespace Newsletter {
    export function fromObject(value: object | null, logger: ILogger): Omit<Newsletter, 'id' | 'discordMessageId'> {
        logger.log('Newsletter.fromObject', { value: value });

        if (value === null)
            throw HttpsError('internal', 'Couldn\'t get newsletter from null.', logger);

        if (!('date' in value) || typeof value.date !== 'string')
            throw HttpsError('internal', 'Couldn\'t get date for newsletter.', logger);

        if (!('titlePage' in value) || typeof value.titlePage !== 'object' || value.titlePage === null)
            throw HttpsError('internal', 'Couldn\'t get title page for newsletter.', logger);

        if (!('title' in value.titlePage) || typeof value.titlePage.title !== 'string')
            throw HttpsError('internal', 'Couldn\'t get title for newsletter title page.', logger);

        if (!('description' in value.titlePage) || typeof value.titlePage.description !== 'string')
            throw HttpsError('internal', 'Couldn\'t get description for newsletter title page.', logger);

        if (!('imageSrc' in value.titlePage) || typeof value.titlePage.imageSrc !== 'string')
            throw HttpsError('internal', 'Couldn\'t get imageSrc for newsletter title page.', logger);

        if (!('month' in value.titlePage) || typeof value.titlePage.month !== 'string' || !Month.typeGuard(value.titlePage.month))
            throw HttpsError('internal', 'Couldn\'t get month for newsletter title page.', logger);

        if (!('year' in value.titlePage) || typeof value.titlePage.year !== 'number')
            throw HttpsError('internal', 'Couldn\'t get year for newsletter title page.', logger);

        if (!('departments' in value) || typeof value.departments !== 'object' || value.departments === null)
            throw HttpsError('internal', 'Couldn\'t get departments for newsletter.', logger);

        const departments = mapRecord(value.departments as Record<Newsletter.Department, unknown>, department => {
            if (department === null)
                return null;
            if (!Array.isArray(department))
                throw HttpsError('internal', 'Couldn\'t get departments for newsletter, no array.', logger);
            return department.map((content: unknown) => {
                if (typeof content !== 'object' || content === null)
                    throw HttpsError('internal', 'Couldn\'t get department content for newsletter, no object.', logger);

                if (!('title' in content) || typeof content.title !== 'string')
                    throw HttpsError('internal', 'Couldn\'t get title for newsletter department.', logger);
        
                if (!('description' in content) || typeof content.description !== 'string')
                    throw HttpsError('internal', 'Couldn\'t get description for newsletter department.', logger);

                return {
                    title: content.title,
                    description: content.description
                };
            });
        });

        if (!('events' in value) || typeof value.events !== 'object' || value.events === null)
            throw HttpsError('internal', 'Couldn\'t get events for newsletter.', logger);

        const events = mapRecord(value.events as Record<EventGroupId, unknown>, eventGroup => {
            if (eventGroup === null)
                return null;
            if (!Array.isArray(eventGroup))
                throw HttpsError('internal', 'Couldn\'t get events for newsletter, no array.', logger);
            return eventGroup.map((event: unknown) => {
                if (typeof event !== 'object' || event === null)
                    throw HttpsError('internal', 'Couldn\'t get event for newsletter, no object.', logger);

                if (!('date' in event) || typeof event.date !== 'string')
                    throw HttpsError('internal', 'Couldn\'t get date for newsletter event.', logger);

                if (!('title' in event) || typeof event.title !== 'string')
                    throw HttpsError('internal', 'Couldn\'t get title for newsletter event.', logger);
        
                if (!('subtitle' in event) || !(typeof event.subtitle === 'string' || event.subtitle === null))
                    throw HttpsError('internal', 'Couldn\'t get subtitle for newsletter event.', logger);

                return {
                    date: UtcDate.decode(event.date),
                    title: event.title,
                    subtitle: event.subtitle
                };
            });
        });

        return {
            date: UtcDate.decode(value.date),
            titlePage: {
                title: value.titlePage.title,
                description: value.titlePage.description,
                imageSrc: value.titlePage.imageSrc,
                month: value.titlePage.month,
                year: value.titlePage.year
            },
            departments: departments,
            events: events
        };
    }
    
    export type Month = 'january' | 'february' | 'march' | 'april' | 'may' | 'june' | 'july' | 'august' | 'september' | 'october' | 'november' | 'december';

    export namespace Month {
        export function typeGuard(value: string): value is Month {
            return ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'].includes(value);
        }
    }

    export type Department = 'football-adults/general' | 'football-adults/first-team' | 'football-adults/second-team' | 'football-youth/big-field' | 'football-youth/small-field' | 'gymnastics' | 'dancing';

    export type Flatten = {
        id: string;
        date: string;
        discordMessageId: string | null;
        titlePage: {
            title: string;
            description: string;
            imageSrc: string;
            month: Newsletter.Month;
            year: number;
        };
        departments: {
            [Department in Newsletter.Department]: {
                title: string;
                description: string;
            }[] | null
        };
        events: {
            [GroupId in EventGroupId]: {
                date: string;
                title: string;
                subtitle: string | null;
            }[] | null;
        };
    };

    export function flatten(newsletter: Newsletter): Newsletter.Flatten;
    export function flatten(newsletter: Omit<Newsletter, 'id'>): Omit<Newsletter.Flatten, 'id'>;
    export function flatten(newsletter: Newsletter | Omit<Newsletter, 'id'>): Newsletter.Flatten | Omit<Newsletter.Flatten, 'id'> {
        return {
            ...'id' in newsletter ? { id: newsletter.id } : {},
            date: newsletter.date.encoded,
            discordMessageId: newsletter.discordMessageId,
            titlePage: newsletter.titlePage,
            departments: newsletter.departments,
            events: mapRecord(newsletter.events, eventGroup => {
                if (eventGroup === null)
                    return null;
                return eventGroup.map(event => ({
                    date: event.date.encoded,
                    title: event.title,
                    subtitle: event.subtitle
                }));
            })
        };
    }

    export function concrete(newsletter: Newsletter.Flatten): Newsletter;
    export function concrete(newsletter: Omit<Newsletter.Flatten, 'id'>): Omit<Newsletter, 'id'>;
    export function concrete(newsletter: Newsletter.Flatten | Omit<Newsletter.Flatten, 'id'>): Newsletter | Omit<Newsletter, 'id'> {
        return {
            ...'id' in newsletter ? { id: newsletter } : {},
            date: UtcDate.decode(newsletter.date),
            discordMessageId: newsletter.discordMessageId,
            titlePage: newsletter.titlePage,
            departments: newsletter.departments,
            events: mapRecord(newsletter.events, eventGroup => {
                if (eventGroup === null)
                    return null;
                return eventGroup.map(event => ({
                    date: UtcDate.decode(event.date),
                    title: event.title,
                    subtitle: event.subtitle
                }));
            })
        };
    }

    export function addDiscordMessageId(newsletter: Omit<Newsletter, 'discordMessageId'>, discordMessageId: string | null): Newsletter;
    export function addDiscordMessageId(newsletter: Omit<Newsletter, 'id' | 'discordMessageId'>, discordMessageId: string | null): Omit<Newsletter, 'id'>;
    export function addDiscordMessageId(newsletter: Omit<Newsletter, 'discordMessageId'> | Omit<Newsletter, 'id' | 'discordMessageId'>, discordMessageId: string | null): Newsletter | Omit<Newsletter, 'id'> {
        return {
            ...newsletter,
            discordMessageId: discordMessageId
        };
    }

    export function discordEmbed(id: string, newsletter: Omit<Newsletter, 'id' | 'discordMessageId'>): EmbedBuilder {
        return new EmbedBuilder()
            .setTitle(newsletter.titlePage.title)
            .setDescription(newsletter.titlePage.description)
            .setURL(`https://svkleinsendelbach-website.web.app/newsletter/${id}`);
    }
}
