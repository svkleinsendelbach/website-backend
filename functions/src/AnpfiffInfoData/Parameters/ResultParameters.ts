import { getIntParameter } from './Parameters';

/** @see {isResultParameters} ts-auto-guard:type-guard */
export interface ResultParameters {
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

export function getResultParameters(url: string | undefined): ResultParameters | undefined {
  try {
    return {
      spielkreis: getIntParameter(url, 'SK'),
      liga: getIntParameter(url, 'Lg'),
      spiel: getIntParameter(url, 'Sp'),
      verein: getIntParameter(url, 'Ver'),
      teamHeim: getIntParameter(url, 'TmHm'),
      teamAway: getIntParameter(url, 'TmGt'),
      top: getIntParameter(url, 'Top'),
      ticker: getIntParameter(url, 'Ticker'),
      men: getIntParameter(url, '(?:m|M)en'),
    };
  } catch {
    return undefined;
  }
}
