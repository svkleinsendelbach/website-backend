import { ResultParameters } from '../../Parameters/ResultParameters';

/** @see {isTeamSpiele} ts-auto-guard:type-guard */
export interface TeamSpiele {
  spiele?: TeamSpieleSpiele[];
  vorbereitungsSpiele?: TeamSpieleSpiele[];
  properties: {
    games?: number;
    wins?: number;
    winsHome?: number;
    winsAway?: number;
    draws?: number;
    losts?: number;
    lostsHome?: number;
    lostsAway?: number;
    gamesToZero?: number;
    gamesWithoutGoalsShot?: number;
  };
}

export interface TeamSpieleSpiele {
  date?: string;
  logoId?: number;
  homeAway?: 'H' | 'A';
  opponent?: string;
  result?: string;
  resultParameters?: ResultParameters;
  sonderwertung?: boolean;
}
