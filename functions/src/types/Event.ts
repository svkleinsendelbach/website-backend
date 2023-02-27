import { HttpsError, type ILogger } from 'firebase-function';
import { type Guid } from '../classes/Guid';

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
    export function typeGuard(value: string): value is EventGroupId {
        return [
            'general', 'football-adults/general', 'football-adults/first-team', 'football-adults/second-team',
            'football-adults/ah-team', 'football-youth/general', 'football-youth/c-youth', 'football-youth/e-youth',
            'football-youth/f-youth', 'football-youth/g-youth', 'gymnastics', 'dancing'
        ].includes(value);
    }
}

export type Event = {
    id: Guid;
    date: Date;
    title: string;
    subtitle?: string;
    link?: string;
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

        if ('subtitle' in value && (typeof value.subtitle !== 'string' && value.subtitle !== undefined))
            throw HttpsError('internal', 'Couldn\'t get subtitle for event.', logger);

        if ('link' in value && (typeof value.link !== 'string' && value.link !== undefined))
            throw HttpsError('internal', 'Couldn\'t get link for event.', logger);

        return {
            date: new Date(value.date),
            title: value.title,
            subtitle: 'subtitle' in value ? value.subtitle as string : undefined,
            link: 'link' in value ? value.link as string : undefined
        };
    }

    export type Flatten = {
        id: string;
        date: string;
        title: string;
        subtitle?: string;
        link?: string;
    };

    export function flatten(event: Event): Event.Flatten;
    export function flatten(event: Omit<Event, 'id'>): Omit<Event.Flatten, 'id'>;
    export function flatten(event: Event | Omit<Event, 'id'>): Event.Flatten | Omit<Event.Flatten, 'id'> {
        return {
            ...('id' in event ? { id: event.id.guidString } : {}),
            date: event.date.toISOString(),
            title: event.title,
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
