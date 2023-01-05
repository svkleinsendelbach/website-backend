import { guid } from './guid';
import { Logger } from '../utils/Logger';
import { httpsError, arrayBuilder } from '../utils/utils';

export interface FiatShamirParameters {
    identifier: guid,
    cs: bigint[]
}

export namespace FiatShamirParameters {
    export function fromObject(value: object, logger: Logger): FiatShamirParameters {
        if (!('identifier' in value) || typeof value.identifier !== 'string')
            throw httpsError('internal', 'Couldn\'t get fiat shamir parameters. No identifier in object.', logger);
        const identifier = guid.fromString(value.identifier, logger.nextIndent);

        if (!('cs' in value)) 
            throw httpsError('internal', 'Couldn\'t get fiat shamir parameters. No cs in object.', logger);
        if (typeof value.cs !== 'object' || value.cs === null)
            throw httpsError('internal', 'Couldn\'t get fiat shamir parameters. cs isn\'t an object.', logger);
        const cs = arrayBuilder((element: any, logger: Logger) => {
            if (typeof element !== 'bigint')
                throw httpsError('internal', `c '${element}' is not a big int.`, logger);
            return element;
        }, 32)(value.cs, logger.nextIndent);

        return {
            identifier: identifier,
            cs: cs
        };
    }
}
