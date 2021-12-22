import { getIntParameter } from './Parameters';

/** @see {isTeamParameters} ts-auto-guard:type-guard */
export interface TeamParameters {
  spielkreis: number;
  ligaId: number;
  teamId: number;
  vereinId: number;
  saisonId: number;
  men: number;
}

export function getTeamParameters(url: string | undefined): TeamParameters | undefined {
  try {
    return {
      spielkreis: getIntParameter(url, 'SK'),
      ligaId: getIntParameter(url, 'Lg'),
      teamId: getIntParameter(url, 'Tm'),
      vereinId: getIntParameter(url, 'Ver'),
      saisonId: getIntParameter(url, 'Sais'),
      men: getIntParameter(url, '(?:m|M)en'),
    };
  } catch {
    return undefined;
  }
}
