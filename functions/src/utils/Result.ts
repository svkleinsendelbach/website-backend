interface IResult<T, E> {
    readonly state: 'success' | 'failure';
    readonly value: T | null;
    readonly error: E | null;
    readonly valueOrError: T | E;
    get(): T;
    map<T2>(mapper: (value: T) => T2): Result<T2, E>
    mapError<E2>(mapper: (value: E) => E2): Result<T, E2>;
  }
  
export type Result<T, E> = Result.Success<T> | Result.Failure<E>;
  
export namespace Result {
    export class Success<T> implements IResult<T, never> {
        public readonly state = 'success' as const;
  
        public constructor(
        public readonly value: T
        ) {}
  
        public get error(): null {
            return null;
        }
  
        public get valueOrError(): T {
            return this.value;
        }
  
        public get(): T {
            return this.value;
        }
  
        public map<T2>(mapper: (value: T) => T2): Result<T2, never> {
            return new Result.Success<T2>(mapper(this.value));
        }
  
        public mapError(): Result<T, never> {
            return this;
        }
    }
  
    export class Failure<E> implements IResult<never, E> {
        public readonly state = 'failure' as const;
  
        public constructor(
        public readonly error: E
        ) {}
  
        public get value(): null {
            return null;
        }
  
        public get valueOrError(): E {
            return this.error;
        }
  
        public get(): never {
            throw this.error;
        }
  
        public map(): Result<never, E> {
            return this;
        }
  
        public mapError<E2>(mapper: (value: E) => E2): Result<never, E2> {
            return new Result.Failure<E2>(mapper(this.error));
        }
    }
  
    export function success<T>(value: T): Result<T, never> {
        return new Result.Success<T>(value);
    }
  
    export function voidSuccess(): Result<void, never> {
        return Result.success(undefined);
    }
  
    export function failure<E>(error: E): Result<never, E> {
        return new Result.Failure<E>(error);
    }
  }
  
