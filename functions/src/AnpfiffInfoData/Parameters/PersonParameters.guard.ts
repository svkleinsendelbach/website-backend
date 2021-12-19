/*
 * Generated type guards for "PersonParameters.ts".
 * WARNING: Do not manually change this file.
 */
import { PersonParameters } from './PersonParameters';

function evaluate(isCorrect: boolean, varName: string, expected: string, actual: any): boolean {
  if (!isCorrect) {
    console.error(`${varName} type mismatch, expected: ${expected}, found:`, actual);
  }
  return isCorrect;
}

export function isPersonParameters(obj: any, argumentName: string = 'personParameters'): obj is PersonParameters {
  return (
    ((obj !== null && typeof obj === 'object') || typeof obj === 'function') &&
    evaluate(typeof obj.spielkreis === 'number', `${argumentName}.spielkreis`, 'number', obj.spielkreis) &&
    evaluate(typeof obj.personId === 'number', `${argumentName}.personId`, 'number', obj.personId)
  );
}
