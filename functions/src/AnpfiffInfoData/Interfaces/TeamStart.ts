import { LigaInfoParameters, TeamInfoParameters, PersonInfoParameters, ResultInfoParameters } from './Parameters';

/** @see {isTeamStart} ts-auto-guard:type-guard */
export interface TeamStart {
  logoId?: number;
  name?: string;
  ligaName?: string;
  ligaParameters?: LigaInfoParameters;
  currentPlacement?: {
    placement?: number;
    logoId?: number;
    teamName?: string;
    teamParameters?: TeamInfoParameters;
    totalGames?: number;
    goalsScored?: number;
    goalsGot?: number;
    points?: number;
  }[];
  topGoalsPlayers?: {
    imageId?: number;
    name?: string;
    personParameters?: PersonInfoParameters;
    totalGoals?: number;
  }[];
  topAssistsPlayers?: {
    imageId?: number;
    name?: string;
    personParameters?: PersonInfoParameters;
    totalAssists?: number;
  }[];
  lastGames?: {
    date?: string;
    homeTeam?: string;
    awayTeam?: string;
    goalsHomeTeam?: number;
    goalsAwayTeam?: number;
    resultParameters?: ResultInfoParameters;
  }[];
  nextGames?: {
    logoId?: number;
    date?: string;
    opponentName?: string;
    opponentParameters?: TeamInfoParameters;
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
