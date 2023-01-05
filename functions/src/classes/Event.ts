import { Logger } from '../utils/Logger';
import { httpsError } from '../utils/utils';
import { guid } from './guid';

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
    export function isValid(value: string): value is EventGroupId {
        return [
            'general', 'football-adults/general', 'football-adults/first-team', 'football-adults/second-team', 
            'football-adults/ah-team', 'football-youth/general', 'football-youth/c-youth', 'football-youth/e-youth', 
            'football-youth/f-youth', 'football-youth/g-youth', 'gymnastics', 'dancing'
        ].includes(value);
    }
}

export interface Event {
  id: guid,
  date: Date,
  title: string,
  subtitle?: string,
  link?: string
}

export namespace Event {
    export function fromObject(value: object, logger: Logger): Omit<Event, 'id'> {
        logger.log('Event.fromObject', { value });

        if (!('date' in value) || typeof value.date !== 'string')
            throw httpsError('internal', 'Couldn\'t get date for event.', logger);
                
        if (!('title' in value) || typeof value.title !== 'string')
            throw httpsError('internal', 'Couldn\'t get title for event.', logger);
        
        if ('subtitle' in value && (typeof value.subtitle !== 'string' && value.subtitle !== undefined))
            throw httpsError('internal', 'Couldn\'t get subtitle for event.', logger);
        
        if ('link' in value && (typeof value.link !== 'string' && value.link !== undefined))
            throw httpsError('internal', 'Couldn\'t get link for event.', logger);

        return {
            date: new Date(value.date),
            title: value.title,
            subtitle: 'subtitle' in value ? value.subtitle as string : undefined,
            link: 'link' in value ? value.link as string : undefined
        };
    }

    export type CallParameters = {
        date: string,
        title: string,
        subtitle?: string,
        link?: string   
    }

    export interface ReturnType {
        id: string,
        date: string,
        title: string,
        subtitle?: string,
        link?: string
      }
}

export interface EventGroup {
    groupId: EventGroupId,
    events: Event.ReturnType[]
}
