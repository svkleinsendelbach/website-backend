import path from 'path';

export interface DateOffset {
  day?: number;
  hour?: number;
  minute?: number;
  second?: number;
}

export function isDateRecent(date: Date, offset: DateOffset): boolean {
  const testDate = new Date();
  testDate.setDate(testDate.getDate() - (offset.day ?? 0));
  testDate.setHours(testDate.getHours() - (offset.hour ?? 0));
  testDate.setMinutes(testDate.getMinutes() - (offset.minute ?? 0));
  testDate.setSeconds(testDate.getSeconds() - (offset.second ?? 0));
  return testDate <= date;
}

export function normalizeRefPathComponent(path: string): string {
  const regexStringsToReplace = ['\\/', '\\.', '#', '\\$', '\\[', '\\]'];
  for (const regexString of regexStringsToReplace) {
    path = path.replace(new RegExp(regexString, 'g'), '_');
  }
  return path;
}

export function absPath(dirUrl: string, url: string | undefined): string | undefined {
  if (url == undefined) {
    return undefined;
  }
  if (path.isAbsolute(url)) {
    const dirPathComponents = dirUrl.split(path.sep);
    let rawPath = '';
    for (const component of dirPathComponents) {
      rawPath = path.join(rawPath, component);
      if (component != 'http:' && component != 'https:' && component != '') {
        return path.join(rawPath, url);
      }
    }
  }
  return path.join(dirUrl, url);
}

export function toNumber(rawValue: string | undefined): number | undefined {
  if (rawValue == undefined) {
    return undefined;
  }
  const value = Number(rawValue);
  return Number.isNaN(value) ? undefined : value;
}

export function toInt(rawValue: string | undefined): number | undefined {
  if (rawValue == undefined) {
    return undefined;
  }
  const value = Number.parseInt(rawValue);
  return Number.isNaN(value) ? undefined : value;
}

export function regexGroup(value: string | undefined, regex: RegExp, groupName: string): string | undefined {
  if (value == undefined) {
    return undefined;
  }
  const groupList = regex.exec(value)?.groups;
  if (groupList == undefined) {
    return undefined;
  }
  return groupList[groupName];
}
