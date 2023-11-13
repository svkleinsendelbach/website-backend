import { HttpsError, ILogger, UtcDate } from "firebase-function";
import { EventGroupId } from "./Event";
import { compactMap, mapRecord, recordEntries, recordValues } from "../utils/record-array";
import { EmbedBuilder, MessageCreateOptions } from "discord.js";

export type Newsletter = {
    id: string;
    alreadyPublished: boolean;
    date: UtcDate;
    titlePage: {
        title: string;
        description: string;
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
    export function fromObject(value: object | null, logger: ILogger): Omit<Newsletter, 'id'> {
        logger.log('Newsletter.fromObject', { value: value });

        if (value === null)
            throw HttpsError('internal', 'Couldn\'t get newsletter from null.', logger);

        if (!('alreadyPublished' in value) || typeof value.alreadyPublished !== 'boolean')
            throw HttpsError('internal', 'Couldn\'t get already published for newsletter.', logger);

        if (!('date' in value) || typeof value.date !== 'string')
            throw HttpsError('internal', 'Couldn\'t get date for newsletter.', logger);

        if (!('titlePage' in value) || typeof value.titlePage !== 'object' || value.titlePage === null)
            throw HttpsError('internal', 'Couldn\'t get title page for newsletter.', logger);

        if (!('title' in value.titlePage) || typeof value.titlePage.title !== 'string')
            throw HttpsError('internal', 'Couldn\'t get title for newsletter title page.', logger);

        if (!('description' in value.titlePage) || typeof value.titlePage.description !== 'string')
            throw HttpsError('internal', 'Couldn\'t get description for newsletter title page.', logger);

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
            alreadyPublished: value.alreadyPublished,
            date: UtcDate.decode(value.date),
            titlePage: {
                title: value.titlePage.title,
                description: value.titlePage.description,
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

        export const title: Record<Month, string> = {
            january: 'Januar',
            february: 'Februar',
            march: 'März',
            april: 'April',
            may: 'Mai',
            june: 'Juni',
            july: 'Juli',
            august: 'August',
            september: 'September',
            october: 'Oktober',
            november: 'November',
            december: 'Dezember'
        };
    }

    export type Department = 'football-adults/general' | 'football-adults/first-team' | 'football-adults/second-team' | 'football-youth/big-field' | 'football-youth/small-field' | 'gymnastics' | 'dancing';

    export namespace Department {
        export const title: Record<Department, string> = {
            'football-adults/general': 'Herrenfußball',
            'football-adults/first-team': 'Erste Mannschaft',
            'football-adults/second-team': 'Zweite Mannschaft',
            'football-youth/big-field': 'Großfeldjugend',
            'football-youth/small-field': 'Kleinfeldjugend',
            'gymnastics': 'Gymnastik',
            'dancing': 'Tanzen'
        };
    }

    export type Flatten = {
        id: string;
        alreadyPublished: boolean;
        date: string;
        titlePage: {
            title: string;
            description: string;
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
            alreadyPublished: newsletter.alreadyPublished,
            date: newsletter.date.encoded,
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
            alreadyPublished: newsletter.alreadyPublished,
            date: UtcDate.decode(newsletter.date),
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

    export function plainText(newsletter: Newsletter, subscriberId: string): string {
        const existsDepartmentsContent = recordValues(newsletter.departments).some(department => department !== null);
        const existsEventsContent = recordValues(newsletter.events).some(eventGroup => eventGroup !== null);
        return `Dieser Newsletter konnte nicht richtig angezeigt werden, folgen Sie dem Link: https://svkleinsendelbach-website.web.app/newsletter/${newsletter.id}\n\n` + 
            `SV Kleinsendelbach - ${Month.title[newsletter.titlePage.month]} ${newsletter.titlePage.year}\n` + 
            `${newsletter.titlePage.title}\n\n` +
            `${newsletter.titlePage.description}\n\n\n` +
            (existsDepartmentsContent ? `Neues aus unseren Abteilungen:\n\n` : '') + 
            compactMap(recordEntries(newsletter.departments), entry => {
                if (entry.value === null)
                    return null;
                return `${Department.title[entry.key]}\n\n` +
                    entry.value.map(content => `${content.title}\n${content.description}`).join('\n\n');
            }).join('\n\n') + '\n\n\n' +
            (existsEventsContent ? `Kommende Termine / Ankündigungen:\n\n` : '') +
            compactMap(recordEntries(newsletter.events), entry => {
                if (entry.value === null)
                    return null;
                return `${EventGroupId.title[entry.key]}\n\n` +
                    entry.value.map(event => `${event.date.description('de-DE', 'Europe/Berlin')}\n${event.title}` + (event.subtitle === null ? '' : `\n${event.subtitle}`)).join('\n\n');
            }).join('\n\n') + '\n\n\n' +
            `Sie möchten unseren Newsletter abbestellen? Folgen Sie dem Link: https://svkleinsendelbach-website.web.app/newsletter/abmelden/${subscriberId}. Sie können sich jederzeit auf unserer Website wieder für den Newsletter anmelden.`;
    }

    export function discordMessage(newsletter: Newsletter): MessageCreateOptions {
        return {
            content: `Newsletter - SV Kleinsendelbach e.V. - ${Month.title[newsletter.titlePage.month]} ${newsletter.titlePage.year}\n\n` +
                `${newsletter.titlePage.title}\n${newsletter.titlePage.description}\n`,
            embeds: [
                ...compactMap(recordEntries(newsletter.departments), entry => {
                    if (entry.value === null)
                        return null;
                    return new EmbedBuilder()
                        .setTitle(`Berichte ${Department.title[entry.key]}`)
                        .setFields(entry.value.map(content => ({
                            name: content.title,
                            value: content.description
                        })));
                }),
                ...compactMap(recordEntries(newsletter.events), entry => {
                    if (entry.value === null)
                        return null;
                    return new EmbedBuilder()
                        .setTitle(`Termine ${EventGroupId.title[entry.key]}`)
                        .setFields(entry.value.map(event => ({
                            name: event.date.description('de-DE', 'Europe/Berlin'),
                            value: event.title + (event.subtitle === null ? '' : event.subtitle)
                        })));
                })
            ]
        };
    }
}
