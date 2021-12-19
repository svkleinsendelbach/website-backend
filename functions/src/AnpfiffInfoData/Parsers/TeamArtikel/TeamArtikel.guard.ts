import { isPersonArtikel } from '../PersonArtikel/PersonArtikel.guard';
import { TeamArtikel } from './TeamArtikel';

export function isTeamArtikel(obj: any, argumentName: string = 'teamArtikel'): obj is TeamArtikel {
  return isPersonArtikel(obj, argumentName);
}
