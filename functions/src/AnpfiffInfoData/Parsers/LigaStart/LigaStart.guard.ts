/*
 * Generated type guards for "LigaStart.ts".
 * WARNING: Do not manually change this file.
 */
import { isTeamParameters } from '../../Parameters/TeamParameters.guard';
import { LigaStart } from './LigaStart';

function evaluate(isCorrect: boolean, varName: string, expected: string, actual: any): boolean {
  if (!isCorrect) {
    console.error(`${varName} type mismatch, expected: ${expected}, found:`, actual);
  }
  return isCorrect;
}

export function isLigaStart(obj: any, argumentName: string = 'ligaStart'): obj is LigaStart {
  return (
    ((obj !== null && typeof obj === 'object') || typeof obj === 'function') &&
    evaluate(
      typeof obj.teams === 'undefined' ||
        (Array.isArray(obj.teams) &&
          obj.teams.every(
            (e: any, i0: number) =>
              ((e !== null && typeof e === 'object') || typeof e === 'function') &&
              evaluate(
                typeof e.logoId === 'undefined' || typeof e.logoId === 'number',
                `${argumentName}.teams[${i0}].logoId`,
                'number | undefined',
                e.logoId,
              ) &&
              evaluate(
                typeof e.teamParameters === 'undefined' || (isTeamParameters(e.teamParameters) as boolean),
                `${argumentName}.teams[${i0}].teamParameters`,
                'import("./src/AnpfiffInfoData/Parameters/TeamParameters").TeamParameters | undefined',
                e.teamParameters,
              ),
          )),
      `${argumentName}.teams`,
      '{ logoId?: number | undefined; teamParameters?: import("./src/AnpfiffInfoData/Parameters/TeamParameters").TeamParameters | undefined; }[] | undefined',
      obj.teams,
    )
  );
}
