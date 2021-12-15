/*
 * Generated type guards for "PersonStart.ts".
 * WARNING: Do not manually change this file.
 */
import { PersonStart } from "../Interfaces/PersonStart";

export function isPersonStart(
  obj: any,
  _argumentName?: string
): obj is PersonStart {
  return (
    ((obj !== null && typeof obj === "object") || typeof obj === "function") &&
    (typeof obj.imageUrl === "undefined" || typeof obj.imageUrl === "string") &&
    (typeof obj.name === "undefined" || typeof obj.name === "string") &&
    ((obj.properties !== null && typeof obj.properties === "object") ||
      typeof obj.properties === "function") &&
    (typeof obj.properties.age === "undefined" ||
      typeof obj.properties.age === "number") &&
    (typeof obj.properties.nationFlagUrl === "undefined" ||
      typeof obj.properties.nationFlagUrl === "string") &&
    (typeof obj.properties.nation === "undefined" ||
      typeof obj.properties.nation === "string") &&
    (typeof obj.properties.strongFoot === "undefined" ||
      typeof obj.properties.strongFoot === "string") &&
    (typeof obj.properties.favoritePosition === "undefined" ||
      typeof obj.properties.favoritePosition === "string") &&
    ((obj.carrier !== null && typeof obj.carrier === "object") ||
      typeof obj.carrier === "function") &&
    (typeof obj.carrier.totalGames === "undefined" ||
      typeof obj.carrier.totalGames === "number") &&
    (typeof obj.carrier.gamesWon === "undefined" ||
      typeof obj.carrier.gamesWon === "number") &&
    (typeof obj.carrier.gamesDraw === "undefined" ||
      typeof obj.carrier.gamesDraw === "number") &&
    (typeof obj.carrier.gamesLost === "undefined" ||
      typeof obj.carrier.gamesLost === "number") &&
    (typeof obj.carrier.totalGoals === "undefined" ||
      typeof obj.carrier.totalGoals === "number") &&
    (typeof obj.carrier.totalTeams === "undefined" ||
      typeof obj.carrier.totalTeams === "number") &&
    (typeof obj.carrier.totalAscents === "undefined" ||
      typeof obj.carrier.totalAscents === "number") &&
    (typeof obj.carrier.totalDescents === "undefined" ||
      typeof obj.carrier.totalDescents === "number") &&
    (typeof obj.playerStations === "undefined" ||
      (Array.isArray(obj.playerStations) &&
        obj.playerStations.every(
          (e: any) =>
            ((e !== null && typeof e === "object") ||
              typeof e === "function") &&
            (typeof e.season === "undefined" || typeof e.season === "string") &&
            (typeof e.teamIconUrl === "undefined" ||
              typeof e.teamIconUrl === "string") &&
            (typeof e.teamName === "undefined" ||
              typeof e.teamName === "string") &&
            (typeof e.teamParameters === "undefined" ||
              (((e.teamParameters !== null &&
                typeof e.teamParameters === "object") ||
                typeof e.teamParameters === "function") &&
                typeof e.teamParameters.spielkreis === "number" &&
                typeof e.teamParameters.ligaId === "number" &&
                typeof e.teamParameters.teamId === "number" &&
                typeof e.teamParameters.vereinId === "number" &&
                typeof e.teamParameters.saisonId === "number" &&
                typeof e.teamParameters.men === "number")) &&
            (typeof e.league === "undefined" || typeof e.league === "string") &&
            (typeof e.ascentDescent === "undefined" ||
              typeof e.ascentDescent === "string")
        ))) &&
    (typeof obj.transfers === "undefined" ||
      (Array.isArray(obj.transfers) &&
        obj.transfers.every(
          (e: any) =>
            ((e !== null && typeof e === "object") ||
              typeof e === "function") &&
            (typeof e.date === "undefined" || typeof e.date === "string") &&
            (typeof e.fromIconUrl === "undefined" ||
              typeof e.fromIconUrl === "string") &&
            (typeof e.fromName === "undefined" ||
              typeof e.fromName === "string") &&
            (typeof e.toIconUrl === "undefined" ||
              typeof e.toIconUrl === "string") &&
            (typeof e.toName === "undefined" || typeof e.toName === "string")
        ))) &&
    (typeof obj.seasonResults === "undefined" ||
      (Array.isArray(obj.seasonResults) &&
        obj.seasonResults.every(
          (e: any) =>
            ((e !== null && typeof e === "object") ||
              typeof e === "function") &&
            (typeof e.season === "undefined" || typeof e.season === "string") &&
            (typeof e.teamName === "undefined" ||
              typeof e.teamName === "string") &&
            (typeof e.teamParameters === "undefined" ||
              (((e.teamParameters !== null &&
                typeof e.teamParameters === "object") ||
                typeof e.teamParameters === "function") &&
                typeof e.teamParameters.spielkreis === "number" &&
                typeof e.teamParameters.ligaId === "number" &&
                typeof e.teamParameters.teamId === "number" &&
                typeof e.teamParameters.vereinId === "number" &&
                typeof e.teamParameters.saisonId === "number" &&
                typeof e.teamParameters.men === "number")) &&
            (typeof e.games === "undefined" || typeof e.games === "number") &&
            (typeof e.goals === "undefined" || typeof e.goals === "number") &&
            (typeof e.assists === "undefined" ||
              typeof e.assists === "number") &&
            (typeof e.substitutionsIn === "undefined" ||
              typeof e.substitutionsIn === "number") &&
            (typeof e.substitutionsOut === "undefined" ||
              typeof e.substitutionsOut === "number" ||
              e.substitutionsOut === "R") &&
            (typeof e.yellowRedCards === "undefined" ||
              typeof e.yellowRedCards === "number") &&
            (typeof e.redCards === "undefined" ||
              typeof e.redCards === "number")
        ))) &&
    (typeof obj.coachStations === "undefined" ||
      (Array.isArray(obj.coachStations) &&
        obj.coachStations.every(
          (e: any) =>
            ((e !== null && typeof e === "object") ||
              typeof e === "function") &&
            (typeof e.season === "undefined" || typeof e.season === "string") &&
            (typeof e.teamIconUrl === "undefined" ||
              typeof e.teamIconUrl === "string") &&
            (typeof e.teamName === "undefined" ||
              typeof e.teamName === "string") &&
            (typeof e.teamParameters === "undefined" ||
              (((e.teamParameters !== null &&
                typeof e.teamParameters === "object") ||
                typeof e.teamParameters === "function") &&
                typeof e.teamParameters.spielkreis === "number" &&
                typeof e.teamParameters.ligaId === "number" &&
                typeof e.teamParameters.teamId === "number" &&
                typeof e.teamParameters.vereinId === "number" &&
                typeof e.teamParameters.saisonId === "number" &&
                typeof e.teamParameters.men === "number")) &&
            (typeof e.league === "undefined" || typeof e.league === "string")
        )))
  );
}
