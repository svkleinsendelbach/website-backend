import { httpsError } from '../utils';
import { Logger } from '../Logger';
import { Crypter } from '../../crypter/Crypter';
import { cryptionKeys } from '../../privateKeys';
import { DatabaseType } from '../../classes/DatabaseType';
import { TrivialParameterType } from './TrivialParameterType';
import { ParameterBuilder } from './ParameterBuilder';

export class ParameterContainer {

    private readonly data: any;

    public constructor(data: any, logger: Logger) {
        logger.log('ParameterContainer.constructor', { data });

        // Check if parameters are hand over
        if (data === undefined || data === null)
            throw httpsError('invalid-argument', 'No parameters hand over by the firebase function.', logger);

        // Check if database type is valid
        if (typeof data.databaseType === 'string')
            throw httpsError('invalid-argument', 'Missing database type in firebase function parameters.', logger);
        const databaseType = DatabaseType.fromString(data.databaseType, logger.nextIndent);
        const crypter = new Crypter(cryptionKeys(databaseType));

        // Get and decrypt parameters
        if (typeof data.parameters !== 'string') 
            throw httpsError('invalid-argument', 'Missing parameters in firebase function parameters.', logger);
        this.data = crypter.decryptDecode(data.parameters);
    }

    private optionalParameter<P extends TrivialParameterType, T>(key: PropertyKey, builder: ParameterBuilder<P, T>, logger: Logger): T | undefined {
        logger.log('ParameterContainer.optionalParameter', { key, builder });

        // Return undefined if the parameter doesn't exist
        if (!this.data.hasOwnProperty(key))
            return undefined;

        // Get the parameter from the firebase function data
        const parameter = this.data[key];

        // Return undefined if the parameter is undefined or null
        if (parameter === undefined || parameter === null)
            return undefined;

        // Check expected types
        for (const expectedType of builder.expectedTypes) {
            if (typeof parameter === expectedType)
                return builder.build(parameter, logger.nextIndent);
        }

        // Invalid type
        throw httpsError('invalid-argument', `Parameter ${key.toString()} has a invalid type, expected: ${builder.expectedTypes}`, logger);
    }

    public parameter<P extends TrivialParameterType, T>(key: PropertyKey, builder: ParameterBuilder<P, T>, logger: Logger): T {
        logger.log('ParameterContainer.parameter', { key, builder });

        // Get parameter that is possible optional
        const parameter = this.optionalParameter(key, builder, logger.nextIndent);

        // Check if the parameter is undefined
        if (typeof parameter === 'undefined') {
            if (!(builder.expectedTypes as TrivialParameterType[]).includes('undefined'))
                throw httpsError('invalid-argument', 'Parameter cannot be undefined.', logger);
            return builder.build(parameter as any, logger.nextIndent);
        }

        // Return parameter
        return parameter;
    }
}
