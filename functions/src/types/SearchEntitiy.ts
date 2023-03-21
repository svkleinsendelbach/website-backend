import { type Event } from './Event';
import { type Report } from './Report';

export type SearchEntityType = 'events' | 'reports';

export namespace SearchEntityType {
    export function typeGuard(value: string): value is SearchEntityType {
        return ['events', 'reports'].includes(value);
    }
}

export type SearchEntity<T extends SearchEntityType> = T extends 'events' ? Event : T extends 'reports' ? Report : never;

export namespace SearchEntity {
    export type Flatten<T extends SearchEntityType> = T extends 'events' ? Event.Flatten : T extends 'reports' ? Report.Flatten : never;
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
