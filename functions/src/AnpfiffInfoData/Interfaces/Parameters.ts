import { toInt } from "../utils";

/** @see {isPersonInfoParameters} ts-auto-guard:type-guard */
export interface PersonInfoParameters {
  spielkreis: number;
  personId: number;
}

/** @see {isTeamInfoParameters} ts-auto-guard:type-guard */
export interface TeamInfoParameters {
  spielkreis: number;
  ligaId: number;
  teamId: number;
  vereinId: number;
  saisonId: number;
  men: number;
}

/** @see {isArtikelInfoParameters} ts-auto-guard:type-guard */
export interface ArtikelInfoParameters {
  spielkreis: number;
  btr: number;
}

export function getPersonInfoParameters(
  url: string | undefined
): PersonInfoParameters | undefined {
  try {
    return {
      spielkreis: getParameterToInt(url, "SK"),
      personId: getParameterToInt(url, "Pers"),
    };
  } catch {
    return undefined;
  }
}

export function getTeamInfoParameters(
  url: string | undefined
): TeamInfoParameters | undefined {
  try {
    return {
      spielkreis: getParameterToInt(url, "SK"),
      ligaId: getParameterToInt(url, "Lg"),
      teamId: getParameterToInt(url, "Tm"),
      vereinId: getParameterToInt(url, "Ver"),
      saisonId: getParameterToInt(url, "Sais"),
      men: getParameterToInt(url, "Men"),
    };
  } catch {
    return undefined;
  }
}

export function getArtikelInfoParameters(
  url: string | undefined
): ArtikelInfoParameters | undefined {
  try {
    return {
      spielkreis: getParameterToInt(url, "SK"),
      btr: getParameterToInt(url, "Btr"),
    };
  } catch {
    return undefined;
  }
}

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

function getParameter(url: string | undefined, key: string): string {
  if (url == undefined) {
    throw new Error();
  }
  const groupList = new RegExp(
    `^\\S*?\\?\\S*?${key}(?<key>\\d+)\\S*?$`,
    "g"
  ).exec(url)?.groups;
  if (groupList == undefined) {
    throw new Error();
  }
  return groupList.key;
}

function getParameterToInt(url: string | undefined, key: string): number {
  const value = toInt(getParameter(url, key));
  if (value == undefined) {
    throw new Error();
  }
  return value;
}
