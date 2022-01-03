import { CorruptedDataError } from './CorruptedDataError';

export class Time {
  public constructor(public hour: number, public minute: number) {}

  private static DEFAULT_PARSE_REGEX = /^(?<hour>\d{2}):(?<minute>\d{2}) Uhr$/;

  public static fromDate(value: Date): Time {
    return new Time(value.getHours(), value.getMinutes());
  }

  public static fromValue(value: any, regex?: RegExp): Time {
    if (typeof value !== 'string') {
      throw new CorruptedDataError(
        `Couldn't parse time from value: '${JSON.stringify(value)}' (${typeof value}). Expected type string.`,
      );
    }
    return Time.fromString(value, regex);
  }

  public static fromString(value: string, regex?: RegExp): Time {
    const groups = (regex ?? Time.DEFAULT_PARSE_REGEX).exec(value)?.groups;
    if (groups == undefined) {
      throw new CorruptedDataError(
        `Couldn't parse time from string value: '${value}'. Expected default format: hh:mm Uhr.`,
      );
    }
    if (groups.hour === undefined || groups.minute === undefined) {
      throw new CorruptedDataError("Regex must contain capturing groups with name 'hour' and 'minute'.");
    }
    const time = new Time(Number(groups.hour), Number(groups.minute));
    if (time.hour < 0 || time.hour > 23) {
      throw new CorruptedDataError(
        `Couldn't parse time from string value: '${value}'. Expected hour between 0 and 23.`,
      );
    }
    if (time.minute < 0 || time.minute > 59) {
      throw new CorruptedDataError(
        `Couldn't parse time from string value: '${value}'. Expected minute between 0 and 59.`,
      );
    }
    return time;
  }

  public compareTo(o: Time): number {
    return this.hour * 60 + this.minute - (o.hour * 60 + o.minute);
  }
}
