import * as functions from 'firebase-functions';

export class Datum {
  public constructor(public year: number, public month: number, public day: number) {}

  private static DEFAULT_PARSE_REGEX = /^(?<year>\d{4})\/(?<month>\d{2})\/(?<day>\d{2})$/;

  public static fromValue(value: any, regex?: RegExp): Datum {
    if (typeof value !== 'string') {
      throw new functions.https.HttpsError(
        'internal',
        `Couldn't parse datum from value: '${JSON.stringify(value)}' (${typeof value}). Expected type string.`,
      );
    }
    return Datum.fromString(value);
  }

  public static fromString(value: string, regex?: RegExp): Datum {
    const groups = (regex ?? Datum.DEFAULT_PARSE_REGEX).exec(value)?.groups;
    if (groups == undefined) {
      throw new functions.https.HttpsError(
        'internal',
        `Couldn't parse datum from string value: '${value}'. Expected format: yyyy/mm/dd.`,
      );
    }
    if (groups.year === undefined || groups.month === undefined || groups.day === undefined) {
      throw new functions.https.HttpsError(
        'internal',
        "Regex must contain capturing groups with name 'year', 'month' and 'day'.",
      );
    }
    const datum = new Datum(Number(groups.year), Number(groups.month), Number(groups.day));
    if (datum.year < 0) {
      throw new functions.https.HttpsError(
        'internal',
        `Couldn't parse datum from string value: '${value}'. Expected positive year.`,
      );
    }
    if (datum.month < 1 || datum.month > 12) {
      throw new functions.https.HttpsError(
        'internal',
        `Couldn't parse datum from string value: '${value}'. Expected month between 1 and 12.`,
      );
    }
    if (datum.day < 1) {
      throw new functions.https.HttpsError(
        'internal',
        `Couldn't parse datum from string value: '${value}'. Expected day to be greater 0.`,
      );
    }
    if (
      ([1, 3, 5, 7, 8, 10, 12].includes(datum.month) && datum.day > 31) ||
      ([4, 6, 9, 11].includes(datum.month) && datum.day > 30)
    ) {
      throw new functions.https.HttpsError(
        'internal',
        `Couldn't parse datum from string value: '${value}'. Expected day to be less or equal than 30 / 31.`,
      );
    }
    if ((datum.year % 4 == 0 && datum.year % 100 != 0) || datum.year % 400 == 0) {
      if (datum.month == 2 && datum.day > 29) {
        throw new functions.https.HttpsError(
          'internal',
          `Couldn't parse datum from string value: '${value}'. Expected day to be less or equal than 29 on fabruary in a lap year.`,
        );
      }
    } else if (datum.month == 2 && datum.day > 28) {
      throw new functions.https.HttpsError(
        'internal',
        `Couldn't parse datum from string value: '${value}'. Expected day to be less or equal than 28 on february.`,
      );
    }
    return datum;
  }
}
