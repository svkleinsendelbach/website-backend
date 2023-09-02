import { HttpsError, type ILogger, UtcDate } from 'firebase-function';
import { Guid } from './Guid';

export type EventGroupId =
    'general' |
    'football-adults/general' |
    'football-adults/first-team' |
    'football-adults/second-team' |
    'football-adults/ah-team' |
    'football-youth/general' |
    'football-youth/c-youth' |
    'football-youth/e-youth' |
    'football-youth/f-youth' |
    'football-youth/g-youth' |
    'gymnastics' |
    'dancing';

export namespace EventGroupId {
    export const all: EventGroupId[] = [
        'general', 'football-adults/general', 'football-adults/first-team', 'football-adults/second-team',
        'football-adults/ah-team', 'football-youth/general', 'football-youth/c-youth', 'football-youth/e-youth',
        'football-youth/f-youth', 'football-youth/g-youth', 'gymnastics', 'dancing'
    ];

    export function typeGuard(value: string): value is EventGroupId {
        return (EventGroupId.all as string[]).includes(value);
    }
}

export type Event = {
    id: Guid;
    date: UtcDate;
    title: string;
    isImportant: boolean;
    subtitle: string | null;
    link: string | null;
};

export namespace Event {
    export function fromObject(value: object | null, logger: ILogger): Omit<Event, 'id'> {
        logger.log('Event.fromObject', { value: value });

        if (value === null)
            throw HttpsError('internal', 'Couldn\'t get event from null.', logger);

        if (!('date' in value) || typeof value.date !== 'string')
            throw HttpsError('internal', 'Couldn\'t get date for event.', logger);

        if (!('title' in value) || typeof value.title !== 'string')
            throw HttpsError('internal', 'Couldn\'t get title for event.', logger);

        if (!('isImportant' in value) || typeof value.isImportant !== 'boolean')
            throw HttpsError('internal', 'Couldn\'t get is important for event.', logger);

        if (!('subtitle' in value) || !(typeof value.subtitle === 'string' || value.subtitle === null))
            throw HttpsError('internal', 'Couldn\'t get subtitle for event.', logger);

        if (!('link' in value) || !(typeof value.link === 'string' || value.link === null))
            throw HttpsError('internal', 'Couldn\'t get link for event.', logger);

        return {
            date: UtcDate.decode(value.date),
            title: value.title,
            isImportant: value.isImportant,
            subtitle: value.subtitle,
            link: value.link
        };
    }

    export type Flatten = {
        id: string;
        date: string;
        title: string;
        isImportant: boolean;
        subtitle: string | null;
        link: string | null;
    };

    export function flatten(event: Event): Event.Flatten;
    export function flatten(event: Omit<Event, 'id'>): Omit<Event.Flatten, 'id'>;
    export function flatten(event: Event | Omit<Event, 'id'>): Event.Flatten | Omit<Event.Flatten, 'id'> {
        return {
            ...('id' in event ? { id: event.id.guidString } : {}),
            date: event.date.encoded,
            title: event.title,
            isImportant: event.isImportant,
            subtitle: event.subtitle,
            link: event.link
        };
    }

    export function concrete(event: Event.Flatten): Event;
    export function concrete(event: Omit<Event.Flatten, 'id'>): Omit<Event, 'id'>;
    export function concrete(event: Event.Flatten | Omit<Event.Flatten, 'id'>): Event | Omit<Event, 'id'> {
        return {
            ...('id' in event ? { id: new Guid(event.id) } : {}),
            date: UtcDate.decode(event.date),
            title: event.title,
            isImportant: event.isImportant,
            subtitle: event.subtitle,
            link: event.link
        };
    }
}

export type EventGroup = {
    groupId: EventGroupId;
    events: Event[];
};

export namespace EventGroup {
    export type Flatten = {
        groupId: EventGroupId;
        events: Event.Flatten[];
    };
}
