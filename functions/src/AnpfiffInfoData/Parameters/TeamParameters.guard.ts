/*
 * Generated type guards for "TeamParameters.ts".
 * WARNING: Do not manually change this file.
 */
import { TeamParameters } from './TeamParameters';

function evaluate(isCorrect: boolean, varName: string, expected: string, actual: any): boolean {
  if (!isCorrect) {
    console.error(`${varName} type mismatch, expected: ${expected}, found:`, actual);
  }
  return isCorrect;
}

export function isTeamParameters(obj: any, argumentName: string = 'teamParameters'): obj is TeamParameters {
  return (
    ((obj !== null && typeof obj === 'object') || typeof obj === 'function') &&
    evaluate(typeof obj.spielkreis === 'number', `${argumentName}.spielkreis`, 'number', obj.spielkreis) &&
    evaluate(typeof obj.ligaId === 'number', `${argumentName}.ligaId`, 'number', obj.ligaId) &&
    evaluate(typeof obj.teamId === 'number', `${argumentName}.teamId`, 'number', obj.teamId) &&
    evaluate(typeof obj.vereinId === 'number', `${argumentName}.vereinId`, 'number', obj.vereinId) &&
    evaluate(typeof obj.saisonId === 'number', `${argumentName}.saisonId`, 'number', obj.saisonId) &&
    evaluate(typeof obj.men === 'number', `${argumentName}.men`, 'number', obj.men)
  );
}
