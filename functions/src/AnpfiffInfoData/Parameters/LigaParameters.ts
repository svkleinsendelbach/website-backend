import { getIntParameter } from './Parameters';

/** @see {isLigaParameters} ts-auto-guard:type-guard */
export interface LigaParameters {
  spielkreis: number;
  rubrik: number;
  liga: number;
  saison: number;
  men: number;
}

export function getLigaParameters(url: string | undefined): LigaParameters | undefined {
  try {
    return {
      spielkreis: getIntParameter(url, 'SK'),
      rubrik: getIntParameter(url, 'Rub'),
      liga: getIntParameter(url, 'Lg'),
      saison: getIntParameter(url, 'Sais'),
      men: getIntParameter(url, '(?:m|M)en'),
    };
  } catch {
    return undefined;
  }
}
