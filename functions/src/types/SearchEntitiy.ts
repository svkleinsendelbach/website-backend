import { type Event } from './Event';
import { type News } from './News';
import { type Report } from './Report';

export type SearchEntityType = 'events' | 'news' | 'reports';

export namespace SearchEntityType {
    export function typeGuard(value: string): value is SearchEntityType {
        return ['events', 'news', 'reports'].includes(value);
    }
}

export type SearchEntity<T extends SearchEntityType> = T extends 'events' ? Event : T extends 'news' ? News : T extends 'reports' ? Report : never;

export namespace SearchEntity {
    export type Flatten<T extends SearchEntityType> = T extends 'events' ? Event.Flatten : T extends 'news' ? News.Flatten : T extends 'reports' ? Report.Flatten : never;
}

export type TypedSearchEntity<T extends SearchEntityType> = {
    [Key in T]: {
        type: Key;
        value: SearchEntity<Key>;
    }
}[T];

export namespace TypedSearchEntity {
    export type Flatten<T extends SearchEntityType> = {
        [Key in T]: {
            type: Key;
            value: SearchEntity.Flatten<Key>;
        }
    }[T];
}
