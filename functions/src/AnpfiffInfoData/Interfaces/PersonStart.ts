import { TeamInfoParameters } from "./Parameters";

/** @see {isPersonStart} ts-auto-guard:type-guard */
export interface PersonStart {
  imageUrl?: string;
  name?: string;
  properties: {
    age?: number;
    nationFlagUrl?: string;
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
    teamIconUrl?: string;
    teamName?: string;
    teamParameters?: TeamInfoParameters;
    league?: string;
    ascentDescent?: string;
  }[];
  transfers?: {
    date?: string;
    fromIconUrl?: string;
    fromName?: string;
    toIconUrl?: string;
    toName?: string;
  }[];
  seasonResults?: {
    season?: string;
    teamName?: string;
    teamParameters?: TeamInfoParameters;
    games?: number;
    goals?: number;
    assists?: number;
    substitutionsIn?: number;
    substitutionsOut?: number | "R";
    yellowRedCards?: number;
    redCards?: number;
  }[];
  coachStations?: {
    season?: string;
    teamIconUrl?: string;
    teamName?: string;
    teamParameters?: TeamInfoParameters;
    league?: string;
  }[];
}

// node_modules/ts-auto-guard/lib/cli.js src/AnpfiffInfoData/Interfaces/PersonStart.ts
