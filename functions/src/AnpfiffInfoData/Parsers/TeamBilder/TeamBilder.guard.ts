import { isPersonBilder } from '../PersonBilder/PersonBilder.guard';
import { TeamBilder } from './TeamBilder';

export function isTeamBilder(obj: any, argumentName: string = 'teamBilder'): obj is TeamBilder {
  return isPersonBilder(obj, argumentName);
}
