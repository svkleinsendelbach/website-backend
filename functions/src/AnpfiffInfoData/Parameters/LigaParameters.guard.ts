/*
 * Generated type guards for "LigaParameters.ts".
 * WARNING: Do not manually change this file.
 */
import { LigaParameters } from './LigaParameters';

function evaluate(isCorrect: boolean, varName: string, expected: string, actual: any): boolean {
  if (!isCorrect) {
    console.error(`${varName} type mismatch, expected: ${expected}, found:`, actual);
  }
  return isCorrect;
}

export function isLigaParameters(obj: any, argumentName: string = 'ligaParameters'): obj is LigaParameters {
  return (
    ((obj !== null && typeof obj === 'object') || typeof obj === 'function') &&
    evaluate(typeof obj.spielkreis === 'number', `${argumentName}.spielkreis`, 'number', obj.spielkreis) &&
    evaluate(typeof obj.rubrik === 'number', `${argumentName}.rubrik`, 'number', obj.rubrik) &&
    evaluate(typeof obj.liga === 'number', `${argumentName}.liga`, 'number', obj.liga) &&
    evaluate(typeof obj.saison === 'number', `${argumentName}.saison`, 'number', obj.saison) &&
    evaluate(typeof obj.men === 'number', `${argumentName}.men`, 'number', obj.men)
  );
}
