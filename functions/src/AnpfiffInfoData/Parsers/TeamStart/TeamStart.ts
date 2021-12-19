import { LigaParameters } from '../../Parameters/LigaParameters';
import { PersonParameters } from '../../Parameters/PersonParameters';
import { ResultParameters } from '../../Parameters/ResultParameters';
import { TeamParameters } from '../../Parameters/TeamParameters';

/** @see {isTeamStart} ts-auto-guard:type-guard */
export interface TeamStart {
  logoId?: number;
  name?: string;
  ligaName?: string;
  ligaParameters?: LigaParameters;
  currentPlacement?: {
    placement?: number;
    logoId?: number;
    teamName?: string;
    teamParameters?: TeamParameters;
    totalGames?: number;
    goalsScored?: number;
    goalsGot?: number;
    points?: number;
  }[];
  topGoalsPlayers?: {
    imageId?: number;
    name?: string;
    personParameters?: PersonParameters;
    totalGoals?: number;
  }[];
  topAssistsPlayers?: {
    imageId?: number;
    name?: string;
    personParameters?: PersonParameters;
    totalAssists?: number;
  }[];
  lastGames?: {
    date?: string;
    homeTeam?: string;
    awayTeam?: string;
    goalsHomeTeam?: number;
    goalsAwayTeam?: number;
    resultParameters?: ResultParameters;
  }[];
  nextGames?: {
    logoId?: number;
    date?: string;
    opponentName?: string;
    opponentParameters?: TeamParameters;
    homeAway?: 'H' | 'A';
    currentPlacement?: number;
  }[];
  properties: {
    totalGames?: number;
    gamesWon?: number;
    gamesDraw?: number;
    gamesLost?: number;
    gamesToZero?: number;
    gamesWithoutGoalsShot?: number;
    totalGoals?: number;
    numberDiffernetScorer?: number;
    ownGoals?: number;
    penaltyGoals?: number;
    totalYellowCards?: number;
    totalYellowRedCards?: number;
    totalRedCards?: number;
    totalPlayers?: number;
    spectetors?: number;
    averageSpectators?: number;
  };
}
