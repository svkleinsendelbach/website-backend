import { httpsError } from '../utils/utils';
import { Logger } from '../utils/Logger';
import { databaseUrl } from '../privateKeys';

export class DatabaseType {
    public constructor(
        public readonly value: DatabaseType.Value
    ) {}

    public get databaseUrl(): string {
        return databaseUrl(this);
    }
}

export namespace DatabaseType {
    export type Value = 'release' | 'debug' | 'testing';

    export function fromString(value: string, logger: Logger): DatabaseType {
        logger.log('DatabaseType.fromString', { value });
        if (value !== 'release' && value !== 'debug' && value !== 'testing')
            throw httpsError('internal', `Couldn't parse DatabaseType, got ${value}.`, logger);
        return new DatabaseType(value);
    }
}
