import { getIntParameter } from './Parameters';

/** @see {isArtikelParameters} ts-auto-guard:type-guard */
export interface ArtikelParameters {
  spielkreis: number;
  btr: number;
}

export function getArtikelParameters(url: string | undefined): ArtikelParameters | undefined {
  try {
    return {
      spielkreis: getIntParameter(url, 'SK'),
      btr: getIntParameter(url, 'Btr'),
    };
  } catch {
    return undefined;
  }
}
