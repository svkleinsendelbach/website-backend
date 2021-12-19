import { TeamParameters } from '../../Parameters/TeamParameters';

/** @see {isPersonStart} ts-auto-guard:type-guard */
export interface PersonStart {
  imageId?: number;
  name?: string;
  properties: {
    age?: number;
    nationFlagId?: number;
    nation?: string;
    strongFoot?: string;
    favoritePosition?: string;
  };
  carrier: {
    totalGames?: number;
    gamesWon?: number;
    gamesDraw?: number;
    gamesLost?: number;
    totalGoals?: number;
    totalTeams?: number;
    totalAscents?: number;
    totalDescents?: number;
  };
  playerStations?: {
    season?: string;
    teamIconId?: number;
    teamName?: string;
    teamParameters?: TeamParameters;
    league?: string;
    ascentDescent?: string;
  }[];
  transfers?: {
    date?: string;
    fromIconId?: number;
    fromName?: string;
    toIconId?: number;
    toName?: string;
  }[];
  seasonResults?: {
    season?: string;
    teamName?: string;
    teamParameters?: TeamParameters;
    games?: number;
    goals?: number;
    assists?: number;
    substitutionsIn?: number;
    substitutionsOut?: number | 'R';
    yellowRedCards?: number;
    redCards?: number;
  }[];
  coachStations?: {
    season?: string;
    teamIconId?: number;
    teamName?: string;
    teamParameters?: TeamParameters;
    league?: string;
  }[];
}

// node_modules/ts-auto-guard/lib/cli.js src/AnpfiffInfoData/Interfaces/PersonStart.ts
