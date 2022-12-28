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
  id: string,
  date: string,
  title: string,
  subtitle?: string,
  link?: string
}

export interface EventGroup {
  groupId: EventGroupId,
  events: Event[]
}
