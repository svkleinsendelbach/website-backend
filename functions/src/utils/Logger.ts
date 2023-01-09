import { StringBuilder } from './StringBuilder';
import { Json } from './utils';

export type LogLevel = 'debug' | 'info' | 'notice';

export namespace LogLevel {
    export function coloredText(logLevel: LogLevel, text: string, colored: boolean): string {
        if (!colored) return text;
        switch (logLevel) {
        case 'debug': return text.yellow();
        case 'info': return text.red();
        case 'notice': return text.blue();
        }
    }
}

interface LoggingProperty {
    functionName: string;
    readonly logLevel: LogLevel;
    readonly indent: number;
    readonly details: { 
        [key: PropertyKey]: any
    };
}

export class Logger {
    private constructor(
        private readonly verbose: Logger.VerboseType,
        private readonly properties: LoggingProperty[],
        private currentIndent: number = 0
    ) {}

    public static start(
        verbose: Logger.VerboseType,
        functionName: string,
        details: { [key: string]: any } = {},
        logLevel: LogLevel = 'debug'
    ): Logger {
        const property: LoggingProperty = {
            functionName: functionName,
            logLevel: logLevel,
            indent: 0,
            details: details
        };
        return new Logger(verbose, [property]);
    }

    public get nextIndent(): Logger {
        return new Logger(this.verbose, this.properties, this.currentIndent + 1);
    }

    public log(
        functionName: string,
        details: { [key: string]: any } = {},
        logLevel: LogLevel = 'debug'
    ) {
        this.properties.push({
            functionName: functionName,
            logLevel: logLevel,
            indent: this.currentIndent,
            details: details
        });
    }

    private propertyString(property: LoggingProperty): string {
        const builder = new StringBuilder();
        builder.appendLine(
            `${' '.repeat(2 * property.indent)}| ${LogLevel.coloredText(property.logLevel, `[${property.functionName}]`, this.verbose === 'colored' || this.verbose === 'coloredVerbose')}`
        );
        if (this.verbose === 'verbose' || this.verbose == 'coloredVerbose') {
            for (const key in property.details) {
                if (Object.prototype.hasOwnProperty.call(property.details, key))
                    builder.append(this.detailString(property.indent, key, property.details[key]));
            }
        }
        return builder.toString();
    }

    private detailString(indent: number, key: string, detail: { [key: string]: any }): string {
        const builder = new StringBuilder();
        const jsonLines = Json.stringify(detail, '  ')?.split('\n') ?? [''];
        builder.appendLine(`${' '.repeat(2 * indent)}| ${`${key}: ${jsonLines.shift()?.gray()}`}`);
        for (const line of jsonLines)
            builder.appendLine(`${' '.repeat(2 * indent)}| ${' '.repeat(key.length + 2)}${line.gray()}`);
        return builder.toString();
    }

    public get joinedMessages(): string {
        const builder = new StringBuilder();
        for (const property of this.properties) 
            builder.append(this.propertyString(property));
        return builder.toString();
    }
}

export namespace Logger {
    export type VerboseType = 'none' | 'verbose' | 'colored' | 'coloredVerbose';
}
