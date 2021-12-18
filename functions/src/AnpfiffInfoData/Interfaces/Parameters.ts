import { toInt } from '../utils';

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

/** @see {isLigaInfoParameters} ts-auto-guard:type-guard */
export interface LigaInfoParameters {
  spielkreis: number;
  rubrik: number;
  liga: number;
  saison: number;
}

/** @see {isResultInfoParameters} ts-auto-guard:type-guard */
export interface ResultInfoParameters {
  spielkreis: number;
  liga: number;
  spiel: number;
  verein: number;
  teamHeim: number;
  teamAway: number;
  top: number;
  ticker: number;
  men: number;
}

export function getPersonInfoParameters(url: string | undefined): PersonInfoParameters | undefined {
  try {
    return {
      spielkreis: getParameterToInt(url, 'SK'),
      personId: getParameterToInt(url, 'Pers'),
    };
  } catch {
    return undefined;
  }
}

export function getTeamInfoParameters(url: string | undefined): TeamInfoParameters | undefined {
  try {
    return {
      spielkreis: getParameterToInt(url, 'SK'),
      ligaId: getParameterToInt(url, 'Lg'),
      teamId: getParameterToInt(url, 'Tm'),
      vereinId: getParameterToInt(url, 'Ver'),
      saisonId: getParameterToInt(url, 'Sais'),
      men: getParameterToInt(url, 'Men', 0),
    };
  } catch {
    return undefined;
  }
}

export function getArtikelInfoParameters(url: string | undefined): ArtikelInfoParameters | undefined {
  try {
    return {
      spielkreis: getParameterToInt(url, 'SK'),
      btr: getParameterToInt(url, 'Btr'),
    };
  } catch {
    return undefined;
  }
}

export function getLigaInfoParameters(url: string | undefined): LigaInfoParameters | undefined {
  try {
    return {
      spielkreis: getParameterToInt(url, 'SK'),
      rubrik: getParameterToInt(url, 'Rub'),
      liga: getParameterToInt(url, 'Lg'),
      saison: getParameterToInt(url, 'Sais'),
    };
  } catch {
    return undefined;
  }
}

export function getResultInfoParameters(url: string | undefined): ResultInfoParameters | undefined {
  try {
    return {
      spielkreis: getParameterToInt(url, 'SK'),
      liga: getParameterToInt(url, 'Lg'),
      spiel: getParameterToInt(url, 'Sp'),
      verein: getParameterToInt(url, 'Ver'),
      teamHeim: getParameterToInt(url, 'TmHm'),
      teamAway: getParameterToInt(url, 'TmGt'),
      top: getParameterToInt(url, 'Top'),
      ticker: getParameterToInt(url, 'Ticker'),
      men: getParameterToInt(url, 'Men'),
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
  const groupList = new RegExp(`^\\S*?\\?\\S*?${key}=(?<key>\\d+)\\S*?$`, 'g').exec(url)?.groups;
  if (groupList == undefined) {
    throw new Error();
  }
  return groupList.key;
}

function getParameterToInt(url: string | undefined, key: string, defaultValue?: number): number {
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
