/*
 * Generated type guards for "TeamSpiele.ts".
 * WARNING: Do not manually change this file.
 */
import { TeamSpiele, TeamSpieleSpiele } from './TeamSpiele';
import { isResultParameters } from '../../Parameters/ResultParameters.guard';

function evaluate(isCorrect: boolean, varName: string, expected: string, actual: any): boolean {
  if (!isCorrect) {
    console.error(`${varName} type mismatch, expected: ${expected}, found:`, actual);
  }
  return isCorrect;
}

export function isTeamSpiele(obj: any, argumentName: string = 'teamSpiele'): obj is TeamSpiele {
  return (
    ((obj !== null && typeof obj === 'object') || typeof obj === 'function') &&
    evaluate(
      typeof obj.spiele === 'undefined' ||
        (Array.isArray(obj.spiele) && obj.spiele.every((e: any) => isTeamSpieleSpiele(e) as boolean)),
      `${argumentName}.spiele`,
      'import("./src/AnpfiffInfoData/Parsers/TeamSpiele/TeamSpiele").TeamSpieleSpiele[] | undefined',
      obj.spiele,
    ) &&
    evaluate(
      typeof obj.vorbereitungsSpiele === 'undefined' ||
        (Array.isArray(obj.vorbereitungsSpiele) &&
          obj.vorbereitungsSpiele.every((e: any) => isTeamSpieleSpiele(e) as boolean)),
      `${argumentName}.vorbereitungsSpiele`,
      'import("./src/AnpfiffInfoData/Parsers/TeamSpiele/TeamSpiele").TeamSpieleSpiele[] | undefined',
      obj.vorbereitungsSpiele,
    ) &&
    evaluate(
      ((obj.properties !== null && typeof obj.properties === 'object') || typeof obj.properties === 'function') &&
        evaluate(
          typeof obj.properties.games === 'undefined' || typeof obj.properties.games === 'number',
          `${argumentName}.properties.games`,
          'number | undefined',
          obj.properties.games,
        ) &&
        evaluate(
          typeof obj.properties.wins === 'undefined' || typeof obj.properties.wins === 'number',
          `${argumentName}.properties.wins`,
          'number | undefined',
          obj.properties.wins,
        ) &&
        evaluate(
          typeof obj.properties.winsHome === 'undefined' || typeof obj.properties.winsHome === 'number',
          `${argumentName}.properties.winsHome`,
          'number | undefined',
          obj.properties.winsHome,
        ) &&
        evaluate(
          typeof obj.properties.winsAway === 'undefined' || typeof obj.properties.winsAway === 'number',
          `${argumentName}.properties.winsAway`,
          'number | undefined',
          obj.properties.winsAway,
        ) &&
        evaluate(
          typeof obj.properties.draws === 'undefined' || typeof obj.properties.draws === 'number',
          `${argumentName}.properties.draws`,
          'number | undefined',
          obj.properties.draws,
        ) &&
        evaluate(
          typeof obj.properties.losts === 'undefined' || typeof obj.properties.losts === 'number',
          `${argumentName}.properties.losts`,
          'number | undefined',
          obj.properties.losts,
        ) &&
        evaluate(
          typeof obj.properties.lostsHome === 'undefined' || typeof obj.properties.lostsHome === 'number',
          `${argumentName}.properties.lostsHome`,
          'number | undefined',
          obj.properties.lostsHome,
        ) &&
        evaluate(
          typeof obj.properties.lostsAway === 'undefined' || typeof obj.properties.lostsAway === 'number',
          `${argumentName}.properties.lostsAway`,
          'number | undefined',
          obj.properties.lostsAway,
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
        ),
      `${argumentName}.properties`,
      '{ games?: number | undefined; wins?: number | undefined; winsHome?: number | undefined; winsAway?: number | undefined; draws?: number | undefined; losts?: number | undefined; lostsHome?: number | undefined; lostsAway?: number | undefined; gamesToZero?: number | undefined; gamesWithoutGoalsShot?: number | undefined; }',
      obj.properties,
    )
  );
}

export function isTeamSpieleSpiele(obj: any, argumentName: string = 'teamSpieleSpiele'): obj is TeamSpieleSpiele {
  return (
    ((obj !== null && typeof obj === 'object') || typeof obj === 'function') &&
    evaluate(
      typeof obj.date === 'undefined' || typeof obj.date === 'string',
      `${argumentName}.date`,
      'string | undefined',
      obj.date,
    ) &&
    evaluate(
      typeof obj.logoId === 'undefined' || typeof obj.logoId === 'number',
      `${argumentName}.logoId`,
      'number | undefined',
      obj.logoId,
    ) &&
    evaluate(
      typeof obj.homeAway === 'undefined' || obj.homeAway === 'H' || obj.homeAway === 'A',
      `${argumentName}.homeAway`,
      '"H" | "A" | undefined',
      obj.homeAway,
    ) &&
    evaluate(
      typeof obj.opponent === 'undefined' || typeof obj.opponent === 'string',
      `${argumentName}.opponent`,
      'string | undefined',
      obj.opponent,
    ) &&
    evaluate(
      typeof obj.result === 'undefined' || typeof obj.result === 'string',
      `${argumentName}.result`,
      'string | undefined',
      obj.result,
    ) &&
    evaluate(
      typeof obj.resultParameters === 'undefined' || (isResultParameters(obj.resultParameters) as boolean),
      `${argumentName}.resultParameters`,
      'import("./src/AnpfiffInfoData/Parameters/ResultParameters").ResultParameters | undefined',
      obj.resultParameters,
    ) &&
    evaluate(
      typeof obj.sonderwertung === 'undefined' || obj.sonderwertung === false || obj.sonderwertung === true,
      `${argumentName}.sonderwertung`,
      'boolean | undefined',
      obj.sonderwertung,
    )
  );
}
