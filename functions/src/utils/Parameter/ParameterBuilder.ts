import { Logger } from '../Logger';
import { httpsError } from '../utils';
import { TrivialParameterType } from './TrivialParameterType';

export type TypeOf<P extends TrivialParameterType> = 
    P extends 'undefined' ? undefined : 
    P extends 'boolean' ? boolean : 
    P extends 'string' ? string :
    P extends 'number' ? number :
    P extends 'bigint' ? bigint :
    P extends 'symbol' ? symbol :
    P extends 'object' ? object : never;

export class ParameterBuilder<P extends TrivialParameterType, T> {
    public constructor(
        public readonly expectedTypes: P[],
        public readonly build: (value: TypeOf<P>, logger: Logger) => T
    ) {}
}

export namespace ParameterBuilder {
    export function trivialBuilder(type: 'undefined'): ParameterBuilder<'undefined', undefined>;
    export function trivialBuilder(type: 'boolean'): ParameterBuilder<'boolean', boolean>;
    export function trivialBuilder(type: 'string'): ParameterBuilder<'string', string>;
    export function trivialBuilder(type: 'number'): ParameterBuilder<'number', number>;
    export function trivialBuilder(type: 'bigint'): ParameterBuilder<'bigint', bigint>;
    export function trivialBuilder(type: 'symbol'): ParameterBuilder<'symbol', symbol>;
    export function trivialBuilder(type: 'object'): ParameterBuilder<'object', object>;
    export function trivialBuilder<P extends TrivialParameterType>(type: P): ParameterBuilder<P, TypeOf<P>> {
        return new ParameterBuilder<P, TypeOf<P>>([type], (value: TypeOf<P>, logger: Logger) => {
            logger.log('trivialParameterBuilder', { type, value });
            return value;
        });
    }

    export function builder<T>(type: 'undefined', build: (value: undefined, logger: Logger) => T): ParameterBuilder<'undefined', T>;
    export function builder<T>(type: 'boolean', build: (value: boolean, logger: Logger) => T): ParameterBuilder<'boolean', T>;
    export function builder<T>(type: 'string', build: (value: string, logger: Logger) => T): ParameterBuilder<'string', T>;
    export function builder<T>(type: 'number', build: (value: number, logger: Logger) => T): ParameterBuilder<'number', T>;
    export function builder<T>(type: 'bigint', build: (value: bigint, logger: Logger) => T): ParameterBuilder<'bigint', T>;
    export function builder<T>(type: 'symbol', build: (value: symbol, logger: Logger) => T): ParameterBuilder<'symbol', T>;
    export function builder<T>(type: 'object', build: (value: object, logger: Logger) => T): ParameterBuilder<'object', T>;
    export function builder<P extends TrivialParameterType, T>(type: P, build: (value: any, logger: Logger) => T): ParameterBuilder<P, T> {
        return new ParameterBuilder<P, T>([type], build);
    }

    export function guardBuilder<T extends undefined>(type: 'undefined', typeGuard: (value: undefined, logger: Logger) => value is T): ParameterBuilder<'undefined', T>;
    export function guardBuilder<T extends boolean>(type: 'boolean', typeGuard: (value: boolean, logger: Logger) => value is T): ParameterBuilder<'boolean', T>;
    export function guardBuilder<T extends string>(type: 'string', typeGuard: (value: string, logger: Logger) => value is T): ParameterBuilder<'string', T>;
    export function guardBuilder<T extends number>(type: 'number', typeGuard: (value: number, logger: Logger) => value is T): ParameterBuilder<'number', T>;
    export function guardBuilder<T extends bigint>(type: 'bigint', typeGuard: (value: bigint, logger: Logger) => value is T): ParameterBuilder<'bigint', T>;
    export function guardBuilder<T extends symbol>(type: 'symbol', typeGuard: (value: symbol, logger: Logger) => value is T): ParameterBuilder<'symbol', T>;
    export function guardBuilder<T extends object>(type: 'v', typeGuard: (value: object, logger: Logger) => value is T): ParameterBuilder<'object', T>;
    export function guardBuilder<P extends TrivialParameterType, T extends P>(type: P, typeGuard: (value: any, logger: Logger) => value is T): ParameterBuilder<P, T> {
        return new ParameterBuilder<P, T>([type], (value: TypeOf<P>, logger: Logger) => {
            if (!typeGuard(value, logger.nextIndent)) 
                throw httpsError('invalid-argument', 'Invalid parameter, type guard failed.', logger);
            return value;
        });  
    }

    export function optionalBuilder<P extends TrivialParameterType, T>(builder: ParameterBuilder<P, T>): ParameterBuilder<P | 'undefined', T | undefined> {
        const expectedTypes: (P | 'undefined')[] = (builder.expectedTypes as TrivialParameterType[]).includes('undefined') ? builder.expectedTypes : ['undefined', ...builder.expectedTypes];
        return new ParameterBuilder<P | 'undefined', T | undefined>(expectedTypes, (value: TypeOf<P> | undefined, logger: Logger) => {
            logger.log('optionalBuilder', { expectedTypes: builder.expectedTypes, value });
            if (typeof value === 'undefined') return undefined;
            return builder.build(value, logger.nextIndent);
        });
    }
}
