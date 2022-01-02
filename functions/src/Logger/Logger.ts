import { ParameterContainer } from '../ParameterContainer';
import { StringBuilder } from '../StringBuilder';
import { LogLevel } from './LogLevel';

/**
 * Used to log all method calls for a firebase function execution.
 */
export class Logger {
  /**
   * Initializes logger with start properties and a current intend.
   * @param {boolean} verbose Specified whether a log message is displayed verbose.
   * @param {Logger.Property[]} properties Start properties of the logger.
   * @param {number} currentIndent Current indention level.
   */
  private constructor(
    private readonly verbose: boolean,
    private readonly properties: Logger.Property[],
    private currentIndent: number = 0,
  ) {}

  /**
   * Initializes a logger with a parameter container and the first logging property.
   * Gets the verbose level from parameter container with name 'verbose'.
   * @param {ParameterContainer} parameterContainer Parameter container to get verbose level.
   * @param {string} functionName Name of function for logging property.
   * @param {{ [key: string]: any }} details Details for logging property.
   * @param {LogLevel} level Log level for logging property.
   * @returns {Logger} Logger with first logging property.
   */
  public static start(
    parameterContainer: ParameterContainer,
    functionName: string,
    details: { [key: string]: any } = {},
    level: LogLevel = LogLevel.debug,
  ): Logger {
    const verbose = parameterContainer.optionalParameter('verbose', 'boolean', undefined) ?? false;
    const property: Logger.Property = {
      functionName: functionName,
      level: level,
      indent: 0,
      details: details,
    };
    return new Logger(verbose, [property]);
  }

  /**
   * Append a new logging property.
   * @param {string} functionName Name of function for logging property.
   * @param {{ [key: string]: any }} details Details for logging property.
   * @param {LogLevel} level Log level for logging property.
   */
  public append(functionName: string, details: { [key: string]: any } = {}, level: LogLevel = LogLevel.debug) {
    this.properties.push({
      functionName: functionName,
      level: level,
      indent: this.currentIndent,
      details: details,
    });
  }

  /**
   * Returns a new logger with idention level increased by one.
   */
  public get ['nextIndent'](): Logger {
    return new Logger(this.verbose, this.properties, this.currentIndent + 1);
  }

  /**
   * Returns a message with all joined logging properties.
   */
  public get ['joined'](): string {
    const builder = new StringBuilder();
    for (const property of this.properties) {
      builder.append(Logger.propertyString(property, this.verbose));
    }
    return builder.toString();
  }

  /**
   * Returns a message of a logging property.
   * @param {Logger.Property} property Property to get message from.
   * @param {boolean} verbose Verbose level of message.
   * @returns {string} Message of logging property.
   */
  private static propertyString(property: Logger.Property, verbose: boolean): string {
    const builder = new StringBuilder();
    builder.appendLine(
      `${' '.repeat(2 * property.indent)}| ${LogLevel.coloredText(property.level, `[${property.functionName}]`)}`,
    );
    if (verbose) {
      for (const key in property.details) {
        if (Object.prototype.hasOwnProperty.call(property.details, key))
          builder.append(this.detailString(property.indent, key, property.details[key]));
      }
    }
    return builder.toString();
  }

  /**
   * Returns a message of a detail of a logging property.
   * @param {number} indent Indention level.
   * @param {string} key Key of the detail.
   * @param {{ [key: string]: any }} detail Detail to get message from.
   * @returns {string} Message of the detail.
   */
  private static detailString(indent: number, key: string, detail: { [key: string]: any }): string {
    const builder = new StringBuilder();
    const jsonLines = JSON.stringify(detail, null, '  ').split('\n');
    builder.appendLine(`${' '.repeat(2 * indent)}| ${`${key}: ${jsonLines.shift()?.gray()}`}`);
    for (const line of jsonLines)
      builder.appendLine(`${' '.repeat(2 * indent)}| ${' '.repeat(key.length + 2)}${line.gray()}`);
    return builder.toString();
  }
}

export namespace Logger {
  /**
   * Property of a log message.
   */
  export interface Property {
    readonly functionName: string;
    readonly level: LogLevel;
    readonly indent: number;
    readonly details: { [key: string]: any };
  }
}
