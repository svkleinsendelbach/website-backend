import { CorruptedDataError } from './CorruptedDataError';
import { Datum } from './Datum';
import { Time } from './Time';

export class FullDatum {
  public constructor(public datum: Datum, public time: Time) {}

  private static DEFAULT_PARSE_REGEX = /^(?:[A-Za-z]{2,3}\. )?(?<datum>(?:\d|\.){10}) (?<time>(?:\d|:){5}) Uhr$/;
  private static DEFAULT_DATUM_REGEX = /^(?<day>\d{2})\.(?<month>\d{2})\.(?<year>\d{4})$/;
  private static DEFAULT_TIME_REGEX = /^(?<hour>\d{2}):(?<minute>\d{2})$/;

  public get ['year'](): number {
    return this.datum.year;
  }
  public get ['month'](): number {
    return this.datum.month;
  }
  public get ['day'](): number {
    return this.datum.day;
  }
  public get ['hour'](): number {
    return this.time.hour;
  }
  public get ['minute'](): number {
    return this.time.minute;
  }

  public static fromDate(value: Date): FullDatum {
    return new FullDatum(Datum.fromDate(value), Time.fromDate(value));
  }

  public static fromValue(value: any, regex?: RegExp): FullDatum {
    if (typeof value !== 'string') {
      throw new CorruptedDataError(
        `Couldn't parse full datum from value: '${JSON.stringify(value)}' (${typeof value}). Expected type string.`,
      );
    }
    return FullDatum.fromString(value, regex);
  }

  public static fromString(value: string, regex?: RegExp): FullDatum {
    const groups = (regex ?? FullDatum.DEFAULT_PARSE_REGEX).exec(value)?.groups;
    if (groups == undefined) {
      throw new CorruptedDataError(
        `Couldn't parse full datum from string value: '${value}'. Expected default format: [A-Za-z]{2,3}. dd.mm.yyyy hh:mm Uhr.`,
      );
    }
    if (groups.datum === undefined || groups.time === undefined) {
      throw new CorruptedDataError("Regex must contain capturing groups with name 'datum' and 'time'.");
    }
    const datum = Datum.fromString(groups.datum, FullDatum.DEFAULT_DATUM_REGEX);
    const time = Time.fromString(groups.time, FullDatum.DEFAULT_TIME_REGEX);
    return new FullDatum(datum, time);
  }

  public compareTo(o: FullDatum): number {
    const a = this.datum.compareTo(o.datum);
    return a != 0 ? a : this.time.compareTo(o.time);
  }
}
