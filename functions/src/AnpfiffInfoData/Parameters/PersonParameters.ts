import { getIntParameter } from './Parameters';

/** @see {isPersonParameters} ts-auto-guard:type-guard */
export interface PersonParameters {
  spielkreis: number;
  personId: number;
}

export function getPersonParameters(url: string | undefined): PersonParameters | undefined {
  try {
    return {
      spielkreis: getIntParameter(url, 'SK'),
      personId: getIntParameter(url, 'Pers'),
    };
  } catch {
    return undefined;
  }
}
