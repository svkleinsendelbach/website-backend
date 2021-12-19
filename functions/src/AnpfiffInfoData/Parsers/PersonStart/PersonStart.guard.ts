/*
 * Generated type guards for "PersonStart.ts".
 * WARNING: Do not manually change this file.
 */
import { isTeamParameters } from '../../Parameters/TeamParameters.guard';
import { PersonStart } from './PersonStart';

function evaluate(isCorrect: boolean, varName: string, expected: string, actual: any): boolean {
  if (!isCorrect) {
    console.error(`${varName} type mismatch, expected: ${expected}, found:`, actual);
  }
  return isCorrect;
}

export function isPersonStart(obj: any, argumentName: string = 'personStart'): obj is PersonStart {
  return (
    ((obj !== null && typeof obj === 'object') || typeof obj === 'function') &&
    evaluate(
      typeof obj.imageId === 'undefined' || typeof obj.imageId === 'number',
      `${argumentName}.imageId`,
      'number | undefined',
      obj.imageId,
    ) &&
    evaluate(
      typeof obj.name === 'undefined' || typeof obj.name === 'string',
      `${argumentName}.name`,
      'string | undefined',
      obj.name,
    ) &&
    evaluate(
      ((obj.properties !== null && typeof obj.properties === 'object') || typeof obj.properties === 'function') &&
        evaluate(
          typeof obj.properties.age === 'undefined' || typeof obj.properties.age === 'number',
          `${argumentName}.properties.age`,
          'number | undefined',
          obj.properties.age,
        ) &&
        evaluate(
          typeof obj.properties.nationFlagId === 'undefined' || typeof obj.properties.nationFlagId === 'number',
          `${argumentName}.properties.nationFlagId`,
          'number | undefined',
          obj.properties.nationFlagId,
        ) &&
        evaluate(
          typeof obj.properties.nation === 'undefined' || typeof obj.properties.nation === 'string',
          `${argumentName}.properties.nation`,
          'string | undefined',
          obj.properties.nation,
        ) &&
        evaluate(
          typeof obj.properties.strongFoot === 'undefined' || typeof obj.properties.strongFoot === 'string',
          `${argumentName}.properties.strongFoot`,
          'string | undefined',
          obj.properties.strongFoot,
        ) &&
        evaluate(
          typeof obj.properties.favoritePosition === 'undefined' || typeof obj.properties.favoritePosition === 'string',
          `${argumentName}.properties.favoritePosition`,
          'string | undefined',
          obj.properties.favoritePosition,
        ),
      `${argumentName}.properties`,
      '{ age?: number | undefined; nationFlagId?: number | undefined; nation?: string | undefined; strongFoot?: string | undefined; favoritePosition?: string | undefined; }',
      obj.properties,
    ) &&
    evaluate(
      ((obj.carrier !== null && typeof obj.carrier === 'object') || typeof obj.carrier === 'function') &&
        evaluate(
          typeof obj.carrier.totalGames === 'undefined' || typeof obj.carrier.totalGames === 'number',
          `${argumentName}.carrier.totalGames`,
          'number | undefined',
          obj.carrier.totalGames,
        ) &&
        evaluate(
          typeof obj.carrier.gamesWon === 'undefined' || typeof obj.carrier.gamesWon === 'number',
          `${argumentName}.carrier.gamesWon`,
          'number | undefined',
          obj.carrier.gamesWon,
        ) &&
        evaluate(
          typeof obj.carrier.gamesDraw === 'undefined' || typeof obj.carrier.gamesDraw === 'number',
          `${argumentName}.carrier.gamesDraw`,
          'number | undefined',
          obj.carrier.gamesDraw,
        ) &&
        evaluate(
          typeof obj.carrier.gamesLost === 'undefined' || typeof obj.carrier.gamesLost === 'number',
          `${argumentName}.carrier.gamesLost`,
          'number | undefined',
          obj.carrier.gamesLost,
        ) &&
        evaluate(
          typeof obj.carrier.totalGoals === 'undefined' || typeof obj.carrier.totalGoals === 'number',
          `${argumentName}.carrier.totalGoals`,
          'number | undefined',
          obj.carrier.totalGoals,
        ) &&
        evaluate(
          typeof obj.carrier.totalTeams === 'undefined' || typeof obj.carrier.totalTeams === 'number',
          `${argumentName}.carrier.totalTeams`,
          'number | undefined',
          obj.carrier.totalTeams,
        ) &&
        evaluate(
          typeof obj.carrier.totalAscents === 'undefined' || typeof obj.carrier.totalAscents === 'number',
          `${argumentName}.carrier.totalAscents`,
          'number | undefined',
          obj.carrier.totalAscents,
        ) &&
        evaluate(
          typeof obj.carrier.totalDescents === 'undefined' || typeof obj.carrier.totalDescents === 'number',
          `${argumentName}.carrier.totalDescents`,
          'number | undefined',
          obj.carrier.totalDescents,
        ),
      `${argumentName}.carrier`,
      '{ totalGames?: number | undefined; gamesWon?: number | undefined; gamesDraw?: number | undefined; gamesLost?: number | undefined; totalGoals?: number | undefined; totalTeams?: number | undefined; totalAscents?: number | undefined; totalDescents?: number | undefined; }',
      obj.carrier,
    ) &&
    evaluate(
      typeof obj.playerStations === 'undefined' ||
        (Array.isArray(obj.playerStations) &&
          obj.playerStations.every(
            (e: any, i0: number) =>
              ((e !== null && typeof e === 'object') || typeof e === 'function') &&
              evaluate(
                typeof e.season === 'undefined' || typeof e.season === 'string',
                `${argumentName}.playerStations[${i0}].season`,
                'string | undefined',
                e.season,
              ) &&
              evaluate(
                typeof e.teamIconId === 'undefined' || typeof e.teamIconId === 'number',
                `${argumentName}.playerStations[${i0}].teamIconId`,
                'number | undefined',
                e.teamIconId,
              ) &&
              evaluate(
                typeof e.teamName === 'undefined' || typeof e.teamName === 'string',
                `${argumentName}.playerStations[${i0}].teamName`,
                'string | undefined',
                e.teamName,
              ) &&
              evaluate(
                typeof e.teamParameters === 'undefined' || (isTeamParameters(e.teamParameters) as boolean),
                `${argumentName}.playerStations[${i0}].teamParameters`,
                'import("./src/AnpfiffInfoData/Parameters/TeamParameters").TeamParameters | undefined',
                e.teamParameters,
              ) &&
              evaluate(
                typeof e.league === 'undefined' || typeof e.league === 'string',
                `${argumentName}.playerStations[${i0}].league`,
                'string | undefined',
                e.league,
              ) &&
              evaluate(
                typeof e.ascentDescent === 'undefined' || typeof e.ascentDescent === 'string',
                `${argumentName}.playerStations[${i0}].ascentDescent`,
                'string | undefined',
                e.ascentDescent,
              ),
          )),
      `${argumentName}.playerStations`,
      '{ season?: string | undefined; teamIconId?: number | undefined; teamName?: string | undefined; teamParameters?: import("./src/AnpfiffInfoData/Parameters/TeamParameters").TeamParameters | undefined; league?: string | undefined; ascentDescent?: string | undefined; }[] | undefined',
      obj.playerStations,
    ) &&
    evaluate(
      typeof obj.transfers === 'undefined' ||
        (Array.isArray(obj.transfers) &&
          obj.transfers.every(
            (e: any, i0: number) =>
              ((e !== null && typeof e === 'object') || typeof e === 'function') &&
              evaluate(
                typeof e.date === 'undefined' || typeof e.date === 'string',
                `${argumentName}.transfers[${i0}].date`,
                'string | undefined',
                e.date,
              ) &&
              evaluate(
                typeof e.fromIconId === 'undefined' || typeof e.fromIconId === 'number',
                `${argumentName}.transfers[${i0}].fromIconId`,
                'number | undefined',
                e.fromIconId,
              ) &&
              evaluate(
                typeof e.fromName === 'undefined' || typeof e.fromName === 'string',
                `${argumentName}.transfers[${i0}].fromName`,
                'string | undefined',
                e.fromName,
              ) &&
              evaluate(
                typeof e.toIconId === 'undefined' || typeof e.toIconId === 'number',
                `${argumentName}.transfers[${i0}].toIconId`,
                'number | undefined',
                e.toIconId,
              ) &&
              evaluate(
                typeof e.toName === 'undefined' || typeof e.toName === 'string',
                `${argumentName}.transfers[${i0}].toName`,
                'string | undefined',
                e.toName,
              ),
          )),
      `${argumentName}.transfers`,
      '{ date?: string | undefined; fromIconId?: number | undefined; fromName?: string | undefined; toIconId?: number | undefined; toName?: string | undefined; }[] | undefined',
      obj.transfers,
    ) &&
    evaluate(
      typeof obj.seasonResults === 'undefined' ||
        (Array.isArray(obj.seasonResults) &&
          obj.seasonResults.every(
            (e: any, i0: number) =>
              ((e !== null && typeof e === 'object') || typeof e === 'function') &&
              evaluate(
                typeof e.season === 'undefined' || typeof e.season === 'string',
                `${argumentName}.seasonResults[${i0}].season`,
                'string | undefined',
                e.season,
              ) &&
              evaluate(
                typeof e.teamName === 'undefined' || typeof e.teamName === 'string',
                `${argumentName}.seasonResults[${i0}].teamName`,
                'string | undefined',
                e.teamName,
              ) &&
              evaluate(
                typeof e.teamParameters === 'undefined' || (isTeamParameters(e.teamParameters) as boolean),
                `${argumentName}.seasonResults[${i0}].teamParameters`,
                'import("./src/AnpfiffInfoData/Parameters/TeamParameters").TeamParameters | undefined',
                e.teamParameters,
              ) &&
              evaluate(
                typeof e.games === 'undefined' || typeof e.games === 'number',
                `${argumentName}.seasonResults[${i0}].games`,
                'number | undefined',
                e.games,
              ) &&
              evaluate(
                typeof e.goals === 'undefined' || typeof e.goals === 'number',
                `${argumentName}.seasonResults[${i0}].goals`,
                'number | undefined',
                e.goals,
              ) &&
              evaluate(
                typeof e.assists === 'undefined' || typeof e.assists === 'number',
                `${argumentName}.seasonResults[${i0}].assists`,
                'number | undefined',
                e.assists,
              ) &&
              evaluate(
                typeof e.substitutionsIn === 'undefined' || typeof e.substitutionsIn === 'number',
                `${argumentName}.seasonResults[${i0}].substitutionsIn`,
                'number | undefined',
                e.substitutionsIn,
              ) &&
              evaluate(
                typeof e.substitutionsOut === 'undefined' ||
                  typeof e.substitutionsOut === 'number' ||
                  e.substitutionsOut === 'R',
                `${argumentName}.seasonResults[${i0}].substitutionsOut`,
                'number | "R" | undefined',
                e.substitutionsOut,
              ) &&
              evaluate(
                typeof e.yellowRedCards === 'undefined' || typeof e.yellowRedCards === 'number',
                `${argumentName}.seasonResults[${i0}].yellowRedCards`,
                'number | undefined',
                e.yellowRedCards,
              ) &&
              evaluate(
                typeof e.redCards === 'undefined' || typeof e.redCards === 'number',
                `${argumentName}.seasonResults[${i0}].redCards`,
                'number | undefined',
                e.redCards,
              ),
          )),
      `${argumentName}.seasonResults`,
      '{ season?: string | undefined; teamName?: string | undefined; teamParameters?: import("./src/AnpfiffInfoData/Parameters/TeamParameters").TeamParameters | undefined; games?: number | undefined; goals?: number | undefined; assists?: number | undefined; substitutionsIn?: number | undefined; substitutionsOut?: number | "R" | undefined; yellowRedCards?: number | undefined; redCards?: number | undefined; }[] | undefined',
      obj.seasonResults,
    ) &&
    evaluate(
      typeof obj.coachStations === 'undefined' ||
        (Array.isArray(obj.coachStations) &&
          obj.coachStations.every(
            (e: any, i0: number) =>
              ((e !== null && typeof e === 'object') || typeof e === 'function') &&
              evaluate(
                typeof e.season === 'undefined' || typeof e.season === 'string',
                `${argumentName}.coachStations[${i0}].season`,
                'string | undefined',
                e.season,
              ) &&
              evaluate(
                typeof e.teamIconId === 'undefined' || typeof e.teamIconId === 'number',
                `${argumentName}.coachStations[${i0}].teamIconId`,
                'number | undefined',
                e.teamIconId,
              ) &&
              evaluate(
                typeof e.teamName === 'undefined' || typeof e.teamName === 'string',
                `${argumentName}.coachStations[${i0}].teamName`,
                'string | undefined',
                e.teamName,
              ) &&
              evaluate(
                typeof e.teamParameters === 'undefined' || (isTeamParameters(e.teamParameters) as boolean),
                `${argumentName}.coachStations[${i0}].teamParameters`,
                'import("./src/AnpfiffInfoData/Parameters/TeamParameters").TeamParameters | undefined',
                e.teamParameters,
              ) &&
              evaluate(
                typeof e.league === 'undefined' || typeof e.league === 'string',
                `${argumentName}.coachStations[${i0}].league`,
                'string | undefined',
                e.league,
              ),
          )),
      `${argumentName}.coachStations`,
      '{ season?: string | undefined; teamIconId?: number | undefined; teamName?: string | undefined; teamParameters?: import("./src/AnpfiffInfoData/Parameters/TeamParameters").TeamParameters | undefined; league?: string | undefined; }[] | undefined',
      obj.coachStations,
    )
  );
}
