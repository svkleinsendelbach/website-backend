/*
 * Generated type guards for "ArtikelParameters.ts".
 * WARNING: Do not manually change this file.
 */
import { ArtikelParameters } from './ArtikelParameters';

function evaluate(isCorrect: boolean, varName: string, expected: string, actual: any): boolean {
  if (!isCorrect) {
    console.error(`${varName} type mismatch, expected: ${expected}, found:`, actual);
  }
  return isCorrect;
}

export function isArtikelParameters(obj: any, argumentName: string = 'artikelParameters'): obj is ArtikelParameters {
  return (
    ((obj !== null && typeof obj === 'object') || typeof obj === 'function') &&
    evaluate(typeof obj.spielkreis === 'number', `${argumentName}.spielkreis`, 'number', obj.spielkreis) &&
    evaluate(typeof obj.btr === 'number', `${argumentName}.btr`, 'number', obj.btr)
  );
}
