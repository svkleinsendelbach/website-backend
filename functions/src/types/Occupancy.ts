import { HttpsError, ILogger, UtcDate } from "firebase-function";
import { Guid } from "./Guid";

export type Occupancy = {
    id: Guid;
    location: Occupancy.Location;
    title: string;
    start: UtcDate;
    end: UtcDate;
    recurring: Occupancy.Recurring | null;
};

export namespace Occupancy {
    export type Location = 'a-field' | 'b-field' | 'sportshome';

    export namespace Location {
        export function typeGuard(value: string): value is Occupancy.Location {
            return ['a-field', 'b-field', 'sportshome'].includes(value);
        }
    }

    export type Recurring = {
        repeatEvery: Recurring.Type;
        untilIncluding: UtcDate;
        excludingDates: UtcDate[];
    };

    export namespace Recurring {
        export type Type = 'day' | 'month' | 'week' | 'year';

        export namespace Type {
            export function typeGuard(value: string): value is Occupancy.Recurring.Type {
                return ['day', 'month', 'week', 'year'].includes(value);
            }
        }

        export function fromObject(value: object | null, logger: ILogger): Recurring | null {
            logger.log('Occupancy.Recurring.fromObject', { value: value });
    
            if (value === null)
                return null;
    
            if (!('repeatEvery' in value) || typeof value.repeatEvery !== 'string' || !Type.typeGuard(value.repeatEvery))
                throw HttpsError('internal', 'Couldn\'t get repeat every for occupancy recurring.', logger);
    
            if (!('untilIncluding' in value) || typeof value.untilIncluding !== 'string')
                throw HttpsError('internal', 'Couldn\'t get until including for occupancy recurring.', logger);
    
            if (!('excludingDates' in value) || !Array.isArray(value.excludingDates))
                throw HttpsError('internal', 'Couldn\'t get excluding dates for occupancy recurring.', logger);

            const excludingDates = value.excludingDates.map((value: unknown) => {
                if (typeof value !== 'string')
                    throw HttpsError('internal', 'Couldn\'t get excluding dates for occupancy recurring.', logger);
                return UtcDate.decode(value);
            });

            return {
                repeatEvery: value.repeatEvery,
                untilIncluding: UtcDate.decode(value.untilIncluding),
                excludingDates: excludingDates
            };
        }

        export type Flatten = {
            repeatEvery: Recurring.Type;
            untilIncluding: string;
            excludingDates: string[];
        };

        export function flatten(recurring: Recurring): Recurring.Flatten {
            return {
                excludingDates: recurring.excludingDates.map(date => date.encoded),
                repeatEvery: recurring.repeatEvery,
                untilIncluding: recurring.untilIncluding.encoded
            };
        }

        export function concrete(recurring: Recurring.Flatten): Recurring {
            return {
                excludingDates: recurring.excludingDates.map(date => UtcDate.decode(date)),
                repeatEvery: recurring.repeatEvery,
                untilIncluding: UtcDate.decode(recurring.untilIncluding)
            };
        }
    }

    export function fromObject(value: object | null, logger: ILogger): Omit<Occupancy, 'id'> {
        logger.log('Occupancy.fromObject', { value: value });

        if (value === null)
            throw HttpsError('internal', 'Couldn\'t get occupancy from null.', logger);

        if (!('location' in value) || typeof value.location !== 'string' || !Location.typeGuard(value.location))
            throw HttpsError('internal', 'Couldn\'t get location for occupancy.', logger);

        if (!('title' in value) || typeof value.title !== 'string')
            throw HttpsError('internal', 'Couldn\'t get title for occupancy.', logger);

        if (!('start' in value) || typeof value.start !== 'string')
            throw HttpsError('internal', 'Couldn\'t get start for occupancy.', logger);

        if (!('end' in value) || typeof value.end !== 'string')
            throw HttpsError('internal', 'Couldn\'t get end for occupancy.', logger);

        if (!('recurring' in value) || typeof value.recurring !== 'object')
            throw HttpsError('internal', 'Couldn\'t get recurring for occupancy.', logger);

        return {
            location: value.location,
            title: value.title,
            start: UtcDate.decode(value.start),
            end: UtcDate.decode(value.end),
            recurring: Recurring.fromObject(value.recurring, logger.nextIndent)
        };
    }

    export type Flatten = {
        id: string;
        location: Occupancy.Location;
        title: string;
        start: string;
        end: string;
        recurring: Occupancy.Recurring.Flatten | null;
    };

    export function flatten(occupancy: Occupancy): Occupancy.Flatten;
    export function flatten(occupancy: Omit<Occupancy, 'id'>): Omit<Occupancy.Flatten, 'id'>;
    export function flatten(occupancy: Occupancy | Omit<Occupancy, 'id'>): Occupancy.Flatten | Omit<Occupancy.Flatten, 'id'> {
        return {
            ...'id' in occupancy ? { id: occupancy.id.guidString } : {},
            end: occupancy.end.encoded,
            location: occupancy.location,
            recurring: occupancy.recurring === null
                ? null
                : Occupancy.Recurring.flatten(occupancy.recurring),
            start: occupancy.start.encoded,
            title: occupancy.title
        };
    }

    export function concrete(occupancy: Occupancy.Flatten): Occupancy;
    export function concrete(occupancy: Omit<Occupancy.Flatten, 'id'>): Omit<Occupancy, 'id'>;
    export function concrete(occupancy: Occupancy.Flatten | Omit<Occupancy.Flatten, 'id'>): Occupancy | Omit<Occupancy, 'id'> {
        return {
            ...'id' in occupancy ? { id: new Guid(occupancy.id) } : {},
            end: UtcDate.decode(occupancy.end),
            location: occupancy.location,
            recurring: occupancy.recurring === null
                ? null
                : Occupancy.Recurring.concrete(occupancy.recurring),
            start: UtcDate.decode(occupancy.start),
            title: occupancy.title
        };
    }
}
