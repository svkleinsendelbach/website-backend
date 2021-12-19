/*
 * Generated type guards for "TeamStart.ts".
 * WARNING: Do not manually change this file.
 */
import { isLigaParameters } from '../../Parameters/LigaParameters.guard';
import { isTeamParameters } from '../../Parameters/TeamParameters.guard';
import { isPersonParameters } from '../../Parameters/PersonParameters.guard';
import { isResultParameters } from '../../Parameters/ResultParameters.guard';
import { TeamStart } from './TeamStart';

function evaluate(isCorrect: boolean, varName: string, expected: string, actual: any): boolean {
  if (!isCorrect) {
    console.error(`${varName} type mismatch, expected: ${expected}, found:`, actual);
  }
  return isCorrect;
}

export function isTeamStart(obj: any, argumentName: string = 'teamStart'): obj is TeamStart {
  return (
    ((obj !== null && typeof obj === 'object') || typeof obj === 'function') &&
    evaluate(
      typeof obj.logoId === 'undefined' || typeof obj.logoId === 'number',
      `${argumentName}.logoId`,
      'number | undefined',
      obj.logoId,
    ) &&
    evaluate(
      typeof obj.name === 'undefined' || typeof obj.name === 'string',
      `${argumentName}.name`,
      'string | undefined',
      obj.name,
    ) &&
    evaluate(
      typeof obj.ligaName === 'undefined' || typeof obj.ligaName === 'string',
      `${argumentName}.ligaName`,
      'string | undefined',
      obj.ligaName,
    ) &&
    evaluate(
      typeof obj.ligaParameters === 'undefined' || (isLigaParameters(obj.ligaParameters) as boolean),
      `${argumentName}.ligaParameters`,
      'import("./src/AnpfiffInfoData/Parameters/LigaParameters").LigaParameters | undefined',
      obj.ligaParameters,
    ) &&
    evaluate(
      typeof obj.currentPlacement === 'undefined' ||
        (Array.isArray(obj.currentPlacement) &&
          obj.currentPlacement.every(
            (e: any, i0: number) =>
              ((e !== null && typeof e === 'object') || typeof e === 'function') &&
              evaluate(
                typeof e.placement === 'undefined' || typeof e.placement === 'number',
                `${argumentName}.currentPlacement[${i0}].placement`,
                'number | undefined',
                e.placement,
              ) &&
              evaluate(
                typeof e.logoId === 'undefined' || typeof e.logoId === 'number',
                `${argumentName}.currentPlacement[${i0}].logoId`,
                'number | undefined',
                e.logoId,
              ) &&
              evaluate(
                typeof e.teamName === 'undefined' || typeof e.teamName === 'string',
                `${argumentName}.currentPlacement[${i0}].teamName`,
                'string | undefined',
                e.teamName,
              ) &&
              evaluate(
                typeof e.teamParameters === 'undefined' || (isTeamParameters(e.teamParameters) as boolean),
                `${argumentName}.currentPlacement[${i0}].teamParameters`,
                'import("./src/AnpfiffInfoData/Parameters/TeamParameters").TeamParameters | undefined',
                e.teamParameters,
              ) &&
              evaluate(
                typeof e.totalGames === 'undefined' || typeof e.totalGames === 'number',
                `${argumentName}.currentPlacement[${i0}].totalGames`,
                'number | undefined',
                e.totalGames,
              ) &&
              evaluate(
                typeof e.goalsScored === 'undefined' || typeof e.goalsScored === 'number',
                `${argumentName}.currentPlacement[${i0}].goalsScored`,
                'number | undefined',
                e.goalsScored,
              ) &&
              evaluate(
                typeof e.goalsGot === 'undefined' || typeof e.goalsGot === 'number',
                `${argumentName}.currentPlacement[${i0}].goalsGot`,
                'number | undefined',
                e.goalsGot,
              ) &&
              evaluate(
                typeof e.points === 'undefined' || typeof e.points === 'number',
                `${argumentName}.currentPlacement[${i0}].points`,
                'number | undefined',
                e.points,
              ),
          )),
      `${argumentName}.currentPlacement`,
      '{ placement?: number | undefined; logoId?: number | undefined; teamName?: string | undefined; teamParameters?: import("./src/AnpfiffInfoData/Parameters/TeamParameters").TeamParameters | undefined; totalGames?: number | undefined; goalsScored?: number | undefined; goalsGot?: number | undefined; points?: number | undefined; }[] | undefined',
      obj.currentPlacement,
    ) &&
    evaluate(
      typeof obj.topGoalsPlayers === 'undefined' ||
        (Array.isArray(obj.topGoalsPlayers) &&
          obj.topGoalsPlayers.every(
            (e: any, i0: number) =>
              ((e !== null && typeof e === 'object') || typeof e === 'function') &&
              evaluate(
                typeof e.imageId === 'undefined' || typeof e.imageId === 'number',
                `${argumentName}.topGoalsPlayers[${i0}].imageId`,
                'number | undefined',
                e.imageId,
              ) &&
              evaluate(
                typeof e.name === 'undefined' || typeof e.name === 'string',
                `${argumentName}.topGoalsPlayers[${i0}].name`,
                'string | undefined',
                e.name,
              ) &&
              evaluate(
                typeof e.personParameters === 'undefined' || (isPersonParameters(e.personParameters) as boolean),
                `${argumentName}.topGoalsPlayers[${i0}].personParameters`,
                'import("./src/AnpfiffInfoData/Parameters/PersonParameters").PersonParameters | undefined',
                e.personParameters,
              ) &&
              evaluate(
                typeof e.totalGoals === 'undefined' || typeof e.totalGoals === 'number',
                `${argumentName}.topGoalsPlayers[${i0}].totalGoals`,
                'number | undefined',
                e.totalGoals,
              ),
          )),
      `${argumentName}.topGoalsPlayers`,
      '{ imageId?: number | undefined; name?: string | undefined; personParameters?: import("./src/AnpfiffInfoData/Parameters/PersonParameters").PersonParameters | undefined; totalGoals?: number | undefined; }[] | undefined',
      obj.topGoalsPlayers,
    ) &&
    evaluate(
      typeof obj.topAssistsPlayers === 'undefined' ||
        (Array.isArray(obj.topAssistsPlayers) &&
          obj.topAssistsPlayers.every(
            (e: any, i0: number) =>
              ((e !== null && typeof e === 'object') || typeof e === 'function') &&
              evaluate(
                typeof e.imageId === 'undefined' || typeof e.imageId === 'number',
                `${argumentName}.topAssistsPlayers[${i0}].imageId`,
                'number | undefined',
                e.imageId,
              ) &&
              evaluate(
                typeof e.name === 'undefined' || typeof e.name === 'string',
                `${argumentName}.topAssistsPlayers[${i0}].name`,
                'string | undefined',
                e.name,
              ) &&
              evaluate(
                typeof e.personParameters === 'undefined' || (isPersonParameters(e.personParameters) as boolean),
                `${argumentName}.topAssistsPlayers[${i0}].personParameters`,
                'import("./src/AnpfiffInfoData/Parameters/PersonParameters").PersonParameters | undefined',
                e.personParameters,
              ) &&
              evaluate(
                typeof e.totalAssists === 'undefined' || typeof e.totalAssists === 'number',
                `${argumentName}.topAssistsPlayers[${i0}].totalAssists`,
                'number | undefined',
                e.totalAssists,
              ),
          )),
      `${argumentName}.topAssistsPlayers`,
      '{ imageId?: number | undefined; name?: string | undefined; personParameters?: import("./src/AnpfiffInfoData/Parameters/PersonParameters").PersonParameters | undefined; totalAssists?: number | undefined; }[] | undefined',
      obj.topAssistsPlayers,
    ) &&
    evaluate(
      typeof obj.lastGames === 'undefined' ||
        (Array.isArray(obj.lastGames) &&
          obj.lastGames.every(
            (e: any, i0: number) =>
              ((e !== null && typeof e === 'object') || typeof e === 'function') &&
              evaluate(
                typeof e.date === 'undefined' || typeof e.date === 'string',
                `${argumentName}.lastGames[${i0}].date`,
                'string | undefined',
                e.date,
              ) &&
              evaluate(
                typeof e.homeTeam === 'undefined' || typeof e.homeTeam === 'string',
                `${argumentName}.lastGames[${i0}].homeTeam`,
                'string | undefined',
                e.homeTeam,
              ) &&
              evaluate(
                typeof e.awayTeam === 'undefined' || typeof e.awayTeam === 'string',
                `${argumentName}.lastGames[${i0}].awayTeam`,
                'string | undefined',
                e.awayTeam,
              ) &&
              evaluate(
                typeof e.goalsHomeTeam === 'undefined' || typeof e.goalsHomeTeam === 'number',
                `${argumentName}.lastGames[${i0}].goalsHomeTeam`,
                'number | undefined',
                e.goalsHomeTeam,
              ) &&
              evaluate(
                typeof e.goalsAwayTeam === 'undefined' || typeof e.goalsAwayTeam === 'number',
                `${argumentName}.lastGames[${i0}].goalsAwayTeam`,
                'number | undefined',
                e.goalsAwayTeam,
              ) &&
              evaluate(
                typeof e.resultParameters === 'undefined' || (isResultParameters(e.resultParameters) as boolean),
                `${argumentName}.lastGames[${i0}].resultParameters`,
                'import("./src/AnpfiffInfoData/Parameters/ResultParameters").ResultParameters | undefined',
                e.resultParameters,
              ),
          )),
      `${argumentName}.lastGames`,
      '{ date?: string | undefined; homeTeam?: string | undefined; awayTeam?: string | undefined; goalsHomeTeam?: number | undefined; goalsAwayTeam?: number | undefined; resultParameters?: import("./src/AnpfiffInfoData/Parameters/ResultParameters").ResultParameters | undefined; }[] | undefined',
      obj.lastGames,
    ) &&
    evaluate(
      typeof obj.nextGames === 'undefined' ||
        (Array.isArray(obj.nextGames) &&
          obj.nextGames.every(
            (e: any, i0: number) =>
              ((e !== null && typeof e === 'object') || typeof e === 'function') &&
              evaluate(
                typeof e.logoId === 'undefined' || typeof e.logoId === 'number',
                `${argumentName}.nextGames[${i0}].logoId`,
                'number | undefined',
                e.logoId,
              ) &&
              evaluate(
                typeof e.date === 'undefined' || typeof e.date === 'string',
                `${argumentName}.nextGames[${i0}].date`,
                'string | undefined',
                e.date,
              ) &&
              evaluate(
                typeof e.opponentName === 'undefined' || typeof e.opponentName === 'string',
                `${argumentName}.nextGames[${i0}].opponentName`,
                'string | undefined',
                e.opponentName,
              ) &&
              evaluate(
                typeof e.opponentParameters === 'undefined' || (isTeamParameters(e.opponentParameters) as boolean),
                `${argumentName}.nextGames[${i0}].opponentParameters`,
                'import("./src/AnpfiffInfoData/Parameters/TeamParameters").TeamParameters | undefined',
                e.opponentParameters,
              ) &&
              evaluate(
                typeof e.homeAway === 'undefined' || e.homeAway === 'H' || e.homeAway === 'A',
                `${argumentName}.nextGames[${i0}].homeAway`,
                '"H" | "A" | undefined',
                e.homeAway,
              ) &&
              evaluate(
                typeof e.currentPlacement === 'undefined' || typeof e.currentPlacement === 'number',
                `${argumentName}.nextGames[${i0}].currentPlacement`,
                'number | undefined',
                e.currentPlacement,
              ),
          )),
      `${argumentName}.nextGames`,
      '{ logoId?: number | undefined; date?: string | undefined; opponentName?: string | undefined; opponentParameters?: import("./src/AnpfiffInfoData/Parameters/TeamParameters").TeamParameters | undefined; homeAway?: "H" | "A" | undefined; currentPlacement?: number | undefined; }[] | undefined',
      obj.nextGames,
    ) &&
    evaluate(
      ((obj.properties !== null && typeof obj.properties === 'object') || typeof obj.properties === 'function') &&
        evaluate(
          typeof obj.properties.totalGames === 'undefined' || typeof obj.properties.totalGames === 'number',
          `${argumentName}.properties.totalGames`,
          'number | undefined',
          obj.properties.totalGames,
        ) &&
        evaluate(
          typeof obj.properties.gamesWon === 'undefined' || typeof obj.properties.gamesWon === 'number',
          `${argumentName}.properties.gamesWon`,
          'number | undefined',
          obj.properties.gamesWon,
        ) &&
        evaluate(
          typeof obj.properties.gamesDraw === 'undefined' || typeof obj.properties.gamesDraw === 'number',
          `${argumentName}.properties.gamesDraw`,
          'number | undefined',
          obj.properties.gamesDraw,
        ) &&
        evaluate(
          typeof obj.properties.gamesLost === 'undefined' || typeof obj.properties.gamesLost === 'number',
          `${argumentName}.properties.gamesLost`,
          'number | undefined',
          obj.properties.gamesLost,
        ) &&
        evaluate(
          typeof obj.properties.gamesToZero === 'undefined' || typeof obj.properties.gamesToZero === 'number',
          `${argumentName}.properties.gamesToZero`,
          'number | undefined',
          obj.properties.gamesToZero,
        ) &&
        evaluate(
          typeof obj.properties.gamesWithoutGoalsShot === 'undefined' ||
            typeof obj.properties.gamesWithoutGoalsShot === 'number',
          `${argumentName}.properties.gamesWithoutGoalsShot`,
          'number | undefined',
          obj.properties.gamesWithoutGoalsShot,
        ) &&
        evaluate(
          typeof obj.properties.totalGoals === 'undefined' || typeof obj.properties.totalGoals === 'number',
          `${argumentName}.properties.totalGoals`,
          'number | undefined',
          obj.properties.totalGoals,
        ) &&
        evaluate(
          typeof obj.properties.numberDiffernetScorer === 'undefined' ||
            typeof obj.properties.numberDiffernetScorer === 'number',
          `${argumentName}.properties.numberDiffernetScorer`,
          'number | undefined',
          obj.properties.numberDiffernetScorer,
        ) &&
        evaluate(
          typeof obj.properties.ownGoals === 'undefined' || typeof obj.properties.ownGoals === 'number',
          `${argumentName}.properties.ownGoals`,
          'number | undefined',
          obj.properties.ownGoals,
        ) &&
        evaluate(
          typeof obj.properties.penaltyGoals === 'undefined' || typeof obj.properties.penaltyGoals === 'number',
          `${argumentName}.properties.penaltyGoals`,
          'number | undefined',
          obj.properties.penaltyGoals,
        ) &&
        evaluate(
          typeof obj.properties.totalYellowCards === 'undefined' || typeof obj.properties.totalYellowCards === 'number',
          `${argumentName}.properties.totalYellowCards`,
          'number | undefined',
          obj.properties.totalYellowCards,
        ) &&
        evaluate(
          typeof obj.properties.totalYellowRedCards === 'undefined' ||
            typeof obj.properties.totalYellowRedCards === 'number',
          `${argumentName}.properties.totalYellowRedCards`,
          'number | undefined',
          obj.properties.totalYellowRedCards,
        ) &&
        evaluate(
          typeof obj.properties.totalRedCards === 'undefined' || typeof obj.properties.totalRedCards === 'number',
          `${argumentName}.properties.totalRedCards`,
          'number | undefined',
          obj.properties.totalRedCards,
        ) &&
        evaluate(
          typeof obj.properties.totalPlayers === 'undefined' || typeof obj.properties.totalPlayers === 'number',
          `${argumentName}.properties.totalPlayers`,
          'number | undefined',
          obj.properties.totalPlayers,
        ) &&
        evaluate(
          typeof obj.properties.spectetors === 'undefined' || typeof obj.properties.spectetors === 'number',
          `${argumentName}.properties.spectetors`,
          'number | undefined',
          obj.properties.spectetors,
        ) &&
        evaluate(
          typeof obj.properties.averageSpectators === 'undefined' ||
            typeof obj.properties.averageSpectators === 'number',
          `${argumentName}.properties.averageSpectators`,
          'number | undefined',
          obj.properties.averageSpectators,
        ),
      `${argumentName}.properties`,
      '{ totalGames?: number | undefined; gamesWon?: number | undefined; gamesDraw?: number | undefined; gamesLost?: number | undefined; gamesToZero?: number | undefined; gamesWithoutGoalsShot?: number | undefined; totalGoals?: number | undefined; numberDiffernetScorer?: number | undefined; ownGoals?: number | undefined; penaltyGoals?: number | undefined; totalYellowCards?: number | undefined; totalYellowRedCards?: number | undefined; totalRedCards?: number | undefined; totalPlayers?: number | undefined; spectetors?: number | undefined; averageSpectators?: number | undefined; }',
      obj.properties,
    )
  );
}
