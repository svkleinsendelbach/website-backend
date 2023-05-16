import { HttpsError, type ILogger } from 'firebase-function';
import { Guid } from './Guid';
import { Color } from './Color';
import { type HexByte } from './HexByte';

export type OccupancyLocation = {
    id: Guid;
    name: string;
    color: Color<HexByte>;
};

export namespace OccupancyLocation {
    export function fromObject(value: object | null, logger: ILogger): Omit<OccupancyLocation, 'id'> {
        logger.log('OccupancyLocation.fromObject', { value: value });

        if (value === null)
            throw HttpsError('internal', 'Couldn\'t get occupancy location from null.', logger);

        if (!('name' in value) || typeof value.name !== 'string')
            throw HttpsError('internal', 'Couldn\'t get name for occupancy location.', logger);

        if (!('color' in value) || typeof value.color !== 'string')
            throw HttpsError('internal', 'Couldn\'t get color for occupancy location.', logger);

        return {
            name: value.name,
            color: Color.fromString(value.color, logger.nextIndent)
        };
    }

    export type Flatten = {
        id: string;
        name: string;
        color: string;
    };

    export function flatten(location: OccupancyLocation): OccupancyLocation.Flatten;
    export function flatten(location: Omit<OccupancyLocation, 'id'>): Omit<OccupancyLocation.Flatten, 'id'>;
    export function flatten(location: OccupancyLocation | Omit<OccupancyLocation, 'id'>): OccupancyLocation.Flatten | Omit<OccupancyLocation.Flatten, 'id'> {
        return {
            ...('id' in location ? { id: location.id.guidString } : {}),
            name: location.name,
            color: Color.flatten(location.color)
        };
    }

    export function concrete(location: OccupancyLocation.Flatten): OccupancyLocation;
    export function concrete(location: Omit<OccupancyLocation.Flatten, 'id'>): Omit<OccupancyLocation, 'id'>;
    export function concrete(location: OccupancyLocation.Flatten | Omit<OccupancyLocation.Flatten, 'id'>): OccupancyLocation | Omit<OccupancyLocation, 'id'> {
        return {
            ...('id' in location ? { id: new Guid(location.id) } : {}),
            name: location.name,
            color: Color.concrete(location.color)
        };
    }
}
