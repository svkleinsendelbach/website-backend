import { toInt } from '../utils';

export function getImageId(url: string | undefined): number | undefined {
  if (url == undefined) {
    return undefined;
  }
  const groupList = /^\S+\/(?<id>\d+)\.(?:png|jpg)$/g.exec(url)?.groups;
  if (groupList == undefined) {
    return undefined;
  }
  return toInt(groupList.id);
}

export function getParameter(url: string | undefined, key: string): string {
  if (url == undefined) {
    throw new Error();
  }
  const groupList = new RegExp(`^\\S*?\\?\\S*?${key}=(?<key>\\d+)\\S*?$`, 'g').exec(url)?.groups;
  if (groupList == undefined) {
    throw new Error();
  }
  return groupList.key;
}

export function getIntParameter(url: string | undefined, key: string, defaultValue?: number): number {
  try {
    const value = toInt(getParameter(url, key));
    if (value == undefined) {
      if (defaultValue != undefined) {
        return defaultValue;
      }
      throw new Error();
    }
    return value;
  } catch (error) {
    if (defaultValue != undefined) {
      return defaultValue;
    }
    throw error;
  }
}
