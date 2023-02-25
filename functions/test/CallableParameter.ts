import { type DatabaseType } from 'firebase-function';

export type CallableParameter<T> =
    T extends DatabaseType ? DatabaseType.Value :
        T extends Date ? string :
            DefaultCallableParameter<T>;

type DefaultCallableParameter<T> = T extends Record<infer K, unknown> ? { [Key in K]: CallableParameter<T[K]> } : T;
