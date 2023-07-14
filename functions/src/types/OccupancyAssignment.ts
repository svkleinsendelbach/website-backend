import { type ILogger, HttpsError } from 'firebase-function';
import { Guid } from './Guid';
import { UtcDate } from './UtcDate';

export type OccupancyAssignment = {
    id: Guid;
    locationIds: Guid[];
    title: string;
    startDate: UtcDate;
    endDate: UtcDate;
};

export namespace OccupancyAssignment {
    export function fromObject(value: object | null, logger: ILogger): Omit<OccupancyAssignment, 'id'> {
        logger.log('OccupancyAssignment.fromObject', { value: value });

        if (value === null)
            throw HttpsError('internal', 'Couldn\'t get occupancy assignment from null.', logger);

        if (!('locationIds' in value) || !Array.isArray(value.locationIds))
            throw HttpsError('internal', 'Couldn\'t get location ids for occupancy assignment.', logger);
        const locationIds = value.locationIds.map((value: unknown) => {
            if (typeof value !== 'string')
                throw HttpsError('internal', 'Couldn\'t get location id for occupancy assignment.', logger);
            return Guid.fromString(value, logger.nextIndent);
        });

        if (!('title' in value) || typeof value.title !== 'string')
            throw HttpsError('internal', 'Couldn\'t get title for occupancy assignment.', logger);

        if (!('startDate' in value) || typeof value.startDate !== 'string')
            throw HttpsError('internal', 'Couldn\'t get start date for occupancy assignment.', logger);

        if (!('endDate' in value) || typeof value.endDate !== 'string')
            throw HttpsError('internal', 'Couldn\'t get end date for occupancy assignment.', logger);

        return {
            locationIds: locationIds,
            title: value.title,
            startDate: UtcDate.decode(value.startDate),
            endDate: UtcDate.decode(value.endDate)
        };
    }

    export type Flatten = {
        id: string;
        locationIds: string[];
        title: string;
        startDate: string;
        endDate: string;
    };

    export function flatten(assignment: OccupancyAssignment): OccupancyAssignment.Flatten;
    export function flatten(assignment: Omit<OccupancyAssignment, 'id'>): Omit<OccupancyAssignment.Flatten, 'id'>;
    export function flatten(assignment: OccupancyAssignment | Omit<OccupancyAssignment, 'id'>): OccupancyAssignment.Flatten | Omit<OccupancyAssignment.Flatten, 'id'> {
        return {
            ...('id' in assignment ? { id: assignment.id.guidString } : {}),
            locationIds: assignment.locationIds.map(id => id.guidString),
            title: assignment.title,
            startDate: assignment.startDate.encoded,
            endDate: assignment.endDate.encoded
        };
    }

    export function concrete(assignment: OccupancyAssignment.Flatten): OccupancyAssignment;
    export function concrete(assignment: Omit<OccupancyAssignment.Flatten, 'id'>): Omit<OccupancyAssignment, 'id'>;
    export function concrete(assignment: OccupancyAssignment.Flatten | Omit<OccupancyAssignment.Flatten, 'id'>): OccupancyAssignment | Omit<OccupancyAssignment, 'id'> {
        return {
            ...('id' in assignment ? { id: new Guid(assignment.id) } : {}),
            locationIds: assignment.locationIds.map(id => new Guid(id)),
            title: assignment.title,
            startDate: UtcDate.decode(assignment.startDate),
            endDate: UtcDate.decode(assignment.endDate)
        };
    }
}
