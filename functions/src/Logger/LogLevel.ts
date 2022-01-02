export enum LogLevel {
  debug,
  info,
  notice,
}

export namespace LogLevel {
  export function coloredText(level: LogLevel, text: string): string {
    switch (level) {
      case LogLevel.debug:
        return text.yellow();
      case LogLevel.info:
        return text.red();
      case LogLevel.notice:
        return text.blue();
    }
  }
}
