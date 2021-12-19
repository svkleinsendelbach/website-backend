/*
 * Generated type guards for "ResultParameters.ts".
 * WARNING: Do not manually change this file.
 */
import { ResultParameters } from './ResultParameters';

function evaluate(isCorrect: boolean, varName: string, expected: string, actual: any): boolean {
  if (!isCorrect) {
    console.error(`${varName} type mismatch, expected: ${expected}, found:`, actual);
  }
  return isCorrect;
}

export function isResultParameters(obj: any, argumentName: string = 'resultParameters'): obj is ResultParameters {
  return (
    ((obj !== null && typeof obj === 'object') || typeof obj === 'function') &&
    evaluate(typeof obj.spielkreis === 'number', `${argumentName}.spielkreis`, 'number', obj.spielkreis) &&
    evaluate(typeof obj.liga === 'number', `${argumentName}.liga`, 'number', obj.liga) &&
    evaluate(typeof obj.spiel === 'number', `${argumentName}.spiel`, 'number', obj.spiel) &&
    evaluate(typeof obj.verein === 'number', `${argumentName}.verein`, 'number', obj.verein) &&
    evaluate(typeof obj.teamHeim === 'number', `${argumentName}.teamHeim`, 'number', obj.teamHeim) &&
    evaluate(typeof obj.teamAway === 'number', `${argumentName}.teamAway`, 'number', obj.teamAway) &&
    evaluate(typeof obj.top === 'number', `${argumentName}.top`, 'number', obj.top) &&
    evaluate(typeof obj.ticker === 'number', `${argumentName}.ticker`, 'number', obj.ticker) &&
    evaluate(typeof obj.men === 'number', `${argumentName}.men`, 'number', obj.men)
  );
}
