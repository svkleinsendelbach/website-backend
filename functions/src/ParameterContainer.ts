import { Logger } from './Logger/Logger';
import { httpsError } from './utils';

/**
 * All valid parameter types: string, number, bigint, boolean or object.
 */
export type ValidParameterTypes = 'string' | 'number' | 'bigint' | 'boolean' | 'object' | 'array';

/**
 * Contains all parameters for firebase function.
 */
export class ParameterContainer {
  /**
   * Initializes parameter container with firebase function data.
   * @param {any} data Data from firebase funtion to get parameters from.
   */
  constructor(private readonly data: any) {}

  /**
   * Returns parameter with specified name and expected type or null if parameter is null or undefined.
   * @param {string} parameterName Name of parameter to get.
   * @param {ValidParameterTypes} expectedType Expected type of the parameter.
   * @return {any | null} Parameter with specified name.
   */
  public optionalParameter(parameterName: string, expectedType: ValidParameterTypes, logger?: Logger): any | undefined;
  public optionalParameter(parameterName: string, expectedType: 'string', logger?: Logger): string | undefined;
  public optionalParameter(parameterName: string, expectedType: 'number', logger?: Logger): number | undefined;
  public optionalParameter(parameterName: string, expectedType: 'bigint', logger?: Logger): bigint | undefined;
  public optionalParameter(parameterName: string, expectedType: 'boolean', logger?: Logger): boolean | undefined;
  public optionalParameter(
    parameterName: string,
    expectedType: 'object',
    logger?: Logger,
  ): Record<PropertyKey, any> | undefined;
  public optionalParameter(parameterName: string, expectedType: 'array', logger?: Logger): any[] | undefined;
  public optionalParameter(parameterName: string, expectedType: ValidParameterTypes, logger?: Logger): any | undefined {
    // Log method execution with parameters
    logger?.append('ParameterContainer.optionalParameter', {
      parameterName: parameterName,
      expectedType: expectedType,
    });

    // Return undefined if data is null
    if (this.data === null || this.data === undefined) return undefined;

    // Get parameter
    const parameter = this.data[parameterName];

    // Return undefined if parameter is undefined
    if (parameter === null || parameter === undefined) return undefined;

    if (
      typeof parameter !== expectedType &&
      (expectedType !== 'array' || typeof parameter !== 'object' || !Array.isArray(parameter))
    )
      throw httpsError(
        'invalid-argument',
        `Couldn't parse '${parameterName}'. Expected type '${expectedType}', but got '${parameter}' from type '${typeof parameter}'.`,
        logger,
      );

    // Return parameter
    return parameter;
  }

  /**
   * Returns parameter with specified name and expected type.
   * @param {string} parameterName Name of parameter to get.
   * @param {ValidParameterTypes} expectedType Expected type of the parameter.
   * @return {any} Parameter with specified name.
   */
  public parameter(parameterName: string, expectedType: 'string', logger: Logger): string;
  public parameter(parameterName: string, expectedType: 'number', logger: Logger): number;
  public parameter(parameterName: string, expectedType: 'bigint', logger: Logger): bigint;
  public parameter(parameterName: string, expectedType: 'boolean', logger: Logger): boolean;
  public parameter(parameterName: string, expectedType: 'object', logger: Logger): Record<PropertyKey, any>;
  public parameter(parameterName: string, expectedType: 'array', logger?: Logger): any[];
  public parameter(parameterName: string, expectedType: ValidParameterTypes, logger: Logger): any {
    // Log method execution with parameters
    logger.append('ParameterContainer.parameter', {
      parameterName: parameterName,
      expectedType: expectedType,
    });

    // Get optional parameter
    const parameter = this.optionalParameter(parameterName, expectedType, logger.nextIndent);

    // Throw an error if parameter is undefined
    if (parameter === undefined)
      throw httpsError(
        'invalid-argument',
        `Couldn't parse '${parameterName}'. Expected type '${expectedType}', but got undefined or null.`,
        logger,
      );

    // Return parameter
    return parameter;
  }
}
