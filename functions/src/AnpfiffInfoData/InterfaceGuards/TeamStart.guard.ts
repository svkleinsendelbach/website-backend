/*
 * Generated type guards for "TeamStart.ts".
 * WARNING: Do not manually change this file.
 */
import { TeamStart } from '../Interfaces/TeamStart';

export function isTeamStart(obj: any, _argumentName?: string): obj is TeamStart {
  return (
    ((obj !== null && typeof obj === 'object') || typeof obj === 'function') &&
    (typeof obj.logoId === 'undefined' || typeof obj.logoId === 'number') &&
    (typeof obj.name === 'undefined' || typeof obj.name === 'string') &&
    (typeof obj.ligaName === 'undefined' || typeof obj.ligaName === 'string') &&
    (typeof obj.ligaParameters === 'undefined' ||
      (((obj.ligaParameters !== null && typeof obj.ligaParameters === 'object') ||
        typeof obj.ligaParameters === 'function') &&
        typeof obj.ligaParameters.spielkreis === 'number' &&
        typeof obj.ligaParameters.rubrik === 'number' &&
        typeof obj.ligaParameters.liga === 'number' &&
        typeof obj.ligaParameters.saison === 'number')) &&
    (typeof obj.currentPlacement === 'undefined' ||
      (Array.isArray(obj.currentPlacement) &&
        obj.currentPlacement.every(
          (e: any) =>
            ((e !== null && typeof e === 'object') || typeof e === 'function') &&
            (typeof e.placement === 'undefined' || typeof e.placement === 'number') &&
            (typeof e.logoId === 'undefined' || typeof e.logoId === 'number') &&
            (typeof e.teamName === 'undefined' || typeof e.teamName === 'string') &&
            (typeof e.teamParameters === 'undefined' ||
              (((e.teamParameters !== null && typeof e.teamParameters === 'object') ||
                typeof e.teamParameters === 'function') &&
                typeof e.teamParameters.spielkreis === 'number' &&
                typeof e.teamParameters.ligaId === 'number' &&
                typeof e.teamParameters.teamId === 'number' &&
                typeof e.teamParameters.vereinId === 'number' &&
                typeof e.teamParameters.saisonId === 'number' &&
                typeof e.teamParameters.men === 'number')) &&
            (typeof e.totalGames === 'undefined' || typeof e.totalGames === 'number') &&
            (typeof e.goalsScored === 'undefined' || typeof e.goalsScored === 'number') &&
            (typeof e.goalsGot === 'undefined' || typeof e.goalsGot === 'number') &&
            (typeof e.points === 'undefined' || typeof e.points === 'number'),
        ))) &&
    (typeof obj.topGoalsPlayers === 'undefined' ||
      (Array.isArray(obj.topGoalsPlayers) &&
        obj.topGoalsPlayers.every(
          (e: any) =>
            ((e !== null && typeof e === 'object') || typeof e === 'function') &&
            (typeof e.imageId === 'undefined' || typeof e.imageId === 'number') &&
            (typeof e.name === 'undefined' || typeof e.name === 'string') &&
            (typeof e.personParameters === 'undefined' ||
              (((e.personParameters !== null && typeof e.personParameters === 'object') ||
                typeof e.personParameters === 'function') &&
                typeof e.personParameters.spielkreis === 'number' &&
                typeof e.personParameters.personId === 'number')) &&
            (typeof e.totalGoals === 'undefined' || typeof e.totalGoals === 'number'),
        ))) &&
    (typeof obj.topAssistsPlayers === 'undefined' ||
      (Array.isArray(obj.topAssistsPlayers) &&
        obj.topAssistsPlayers.every(
          (e: any) =>
            ((e !== null && typeof e === 'object') || typeof e === 'function') &&
            (typeof e.imageId === 'undefined' || typeof e.imageId === 'number') &&
            (typeof e.name === 'undefined' || typeof e.name === 'string') &&
            (typeof e.personParameters === 'undefined' ||
              (((e.personParameters !== null && typeof e.personParameters === 'object') ||
                typeof e.personParameters === 'function') &&
                typeof e.personParameters.spielkreis === 'number' &&
                typeof e.personParameters.personId === 'number')) &&
            (typeof e.totalAssists === 'undefined' || typeof e.totalAssists === 'number'),
        ))) &&
    (typeof obj.lastGames === 'undefined' ||
      (Array.isArray(obj.lastGames) &&
        obj.lastGames.every(
          (e: any) =>
            ((e !== null && typeof e === 'object') || typeof e === 'function') &&
            (typeof e.date === 'undefined' || typeof e.date === 'string') &&
            (typeof e.homeTeam === 'undefined' || typeof e.homeTeam === 'string') &&
            (typeof e.awayTeam === 'undefined' || typeof e.awayTeam === 'string') &&
            (typeof e.goalsHomeTeam === 'undefined' || typeof e.goalsHomeTeam === 'number') &&
            (typeof e.goalsAwayTeam === 'undefined' || typeof e.goalsAwayTeam === 'number') &&
            (typeof e.resultParameters === 'undefined' ||
              (((e.resultParameters !== null && typeof e.resultParameters === 'object') ||
                typeof e.resultParameters === 'function') &&
                typeof e.resultParameters.spielkreis === 'number' &&
                typeof e.resultParameters.liga === 'number' &&
                typeof e.resultParameters.spiel === 'number' &&
                typeof e.resultParameters.verein === 'number' &&
                typeof e.resultParameters.teamHeim === 'number' &&
                typeof e.resultParameters.teamAway === 'number' &&
                typeof e.resultParameters.top === 'number' &&
                typeof e.resultParameters.ticker === 'number' &&
                typeof e.resultParameters.men === 'number')),
        ))) &&
    (typeof obj.nextGames === 'undefined' ||
      (Array.isArray(obj.nextGames) &&
        obj.nextGames.every(
          (e: any) =>
            ((e !== null && typeof e === 'object') || typeof e === 'function') &&
            (typeof e.logoId === 'undefined' || typeof e.logoId === 'number') &&
            (typeof e.date === 'undefined' || typeof e.date === 'string') &&
            (typeof e.opponentName === 'undefined' || typeof e.opponentName === 'string') &&
            (typeof e.opponentParameters === 'undefined' ||
              (((e.opponentParameters !== null && typeof e.opponentParameters === 'object') ||
                typeof e.opponentParameters === 'function') &&
                typeof e.opponentParameters.spielkreis === 'number' &&
                typeof e.opponentParameters.ligaId === 'number' &&
                typeof e.opponentParameters.teamId === 'number' &&
                typeof e.opponentParameters.vereinId === 'number' &&
                typeof e.opponentParameters.saisonId === 'number' &&
                typeof e.opponentParameters.men === 'number')) &&
            (typeof e.homeAway === 'undefined' || e.homeAway === 'H' || e.homeAway === 'A') &&
            (typeof e.currentPlacement === 'undefined' || typeof e.currentPlacement === 'number'),
        ))) &&
    ((obj.properties !== null && typeof obj.properties === 'object') || typeof obj.properties === 'function') &&
    (typeof obj.properties.totalGames === 'undefined' || typeof obj.properties.totalGames === 'number') &&
    (typeof obj.properties.gamesWon === 'undefined' || typeof obj.properties.gamesWon === 'number') &&
    (typeof obj.properties.gamesDraw === 'undefined' || typeof obj.properties.gamesDraw === 'number') &&
    (typeof obj.properties.gamesLost === 'undefined' || typeof obj.properties.gamesLost === 'number') &&
    (typeof obj.properties.gamesToZero === 'undefined' || typeof obj.properties.gamesToZero === 'number') &&
    (typeof obj.properties.gamesWithoutGoalsShot === 'undefined' ||
      typeof obj.properties.gamesWithoutGoalsShot === 'number') &&
    (typeof obj.properties.totalGoals === 'undefined' || typeof obj.properties.totalGoals === 'number') &&
    (typeof obj.properties.numberDiffernetScorer === 'undefined' ||
      typeof obj.properties.numberDiffernetScorer === 'number') &&
    (typeof obj.properties.ownGoals === 'undefined' || typeof obj.properties.ownGoals === 'number') &&
    (typeof obj.properties.penaltyGoals === 'undefined' || typeof obj.properties.penaltyGoals === 'number') &&
    (typeof obj.properties.totalYellowCards === 'undefined' || typeof obj.properties.totalYellowCards === 'number') &&
    (typeof obj.properties.totalYellowRedCards === 'undefined' ||
      typeof obj.properties.totalYellowRedCards === 'number') &&
    (typeof obj.properties.totalRedCards === 'undefined' || typeof obj.properties.totalRedCards === 'number') &&
    (typeof obj.properties.totalPlayers === 'undefined' || typeof obj.properties.totalPlayers === 'number') &&
    (typeof obj.properties.spectetors === 'undefined' || typeof obj.properties.spectetors === 'number') &&
    (typeof obj.properties.averageSpectators === 'undefined' || typeof obj.properties.averageSpectators === 'number')
  );
}
