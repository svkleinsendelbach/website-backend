import { type ILogger, HttpsError } from 'firebase-function';
import { Guid } from './Guid';

export type OccupancyAssignment = {
    id: Guid;
    locationId: Guid;
    title: string;
    startDate: Date;
    endDate: Date;
};

export namespace OccupancyAssignment {
    export function fromObject(value: object | null, logger: ILogger): Omit<OccupancyAssignment, 'id'> {
        logger.log('OccupancyAssignment.fromObject', { value: value });

        if (value === null)
            throw HttpsError('internal', 'Couldn\'t get occupancy assignment from null.', logger);

        if (!('locationId' in value) || typeof value.locationId !== 'string')
            throw HttpsError('internal', 'Couldn\'t get location id for occupancy assignment.', logger);

        if (!('title' in value) || typeof value.title !== 'string')
            throw HttpsError('internal', 'Couldn\'t get title for occupancy assignment.', logger);

        if (!('startDate' in value) || typeof value.startDate !== 'string')
            throw HttpsError('internal', 'Couldn\'t get start date for occupancy assignment.', logger);

        if (!('endDate' in value) || typeof value.endDate !== 'string')
            throw HttpsError('internal', 'Couldn\'t get end date for occupancy assignment.', logger);

        return {
            locationId: Guid.fromString(value.locationId, logger.nextIndent),
            title: value.title,
            startDate: new Date(value.startDate),
            endDate: new Date(value.endDate)
        };
    }

    export type Flatten = {
        id: string;
        locationId: string;
        title: string;
        startDate: string;
        endDate: string;
    };

    export function flatten(assignment: OccupancyAssignment): OccupancyAssignment.Flatten;
    export function flatten(assignment: Omit<OccupancyAssignment, 'id'>): Omit<OccupancyAssignment.Flatten, 'id'>;
    export function flatten(assignment: OccupancyAssignment | Omit<OccupancyAssignment, 'id'>): OccupancyAssignment.Flatten | Omit<OccupancyAssignment.Flatten, 'id'> {
        return {
            ...('id' in assignment ? { id: assignment.id.guidString } : {}),
            locationId: assignment.locationId.guidString,
            title: assignment.title,
            startDate: assignment.startDate.toISOString(),
            endDate: assignment.endDate.toISOString()
        };
    }

    export function concrete(assignment: OccupancyAssignment.Flatten): OccupancyAssignment;
    export function concrete(assignment: Omit<OccupancyAssignment.Flatten, 'id'>): Omit<OccupancyAssignment, 'id'>;
    export function concrete(assignment: OccupancyAssignment.Flatten | Omit<OccupancyAssignment.Flatten, 'id'>): OccupancyAssignment | Omit<OccupancyAssignment, 'id'> {
        return {
            ...('id' in assignment ? { id: new Guid(assignment.id) } : {}),
            locationId: new Guid(assignment.locationId),
            title: assignment.title,
            startDate: new Date(assignment.startDate),
            endDate: new Date(assignment.endDate)
        };
    }
}
