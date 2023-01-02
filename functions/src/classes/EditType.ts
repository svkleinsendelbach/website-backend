import { httpsError } from '../utils/utils';
import { Logger } from '../utils/Logger';

export class EditType {
    public constructor(
        public readonly value: EditType.Value
    ) {}
}

export namespace EditType {
    export type Value = 'add' | 'change' | 'remove';
    
    export function fromString(value: string, logger: Logger): EditType {
        logger.log('EditType.fromString', { value });
        if (value !== 'add' && value !== 'change' && value !== 'remove') 
            throw httpsError('internal', `Couldn't parse EditType, got ${value}.`, logger);
        return new EditType(value);
    }
}
