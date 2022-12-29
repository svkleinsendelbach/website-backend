import { FunctionsErrorCode } from 'firebase-functions/lib/common/providers/https';
import { DatabaseType } from './DatabaseType';
import { FiatShamirParameters } from './fiatShamir';

export interface FirebaseFunction<Parameters, ReturnType> {

    /**
     * Parser to parse firebase function parameters from parameter container.
     */
    parameters: Parameters;

    /**
     * Execute this firebase function.
     * @returns { Promise<ReturnType> } Return value of this firebase function.
     */
    executeFunction(): Promise<ReturnType>;
}

export namespace FirebaseFunction {
    export interface DefaultParameters {
        fiatShamirParameters: FiatShamirParameters
        databaseType: DatabaseType
    }

    export type Parameters<T> = T extends FirebaseFunction<infer Parameters, any> ? Parameters : never;

    export type ReturnType<T> = T extends FirebaseFunction<any, infer ReturnType> ? ReturnType : never;

    export type Result<ReturnValue> = Result.Success<ReturnValue> | Result.Failure;

    export namespace Result {
        export interface Success<ReturnValue> {
            state: 'success',
            returnValue: ReturnValue,
        }

        export interface Failure {
            state: 'failure',
            error: Result.Error,
        }
    
        export interface Error {
            code: FunctionsErrorCode,
            message: string,
            details?: unknown,
            stack?: string,
        }   
    } 
}

