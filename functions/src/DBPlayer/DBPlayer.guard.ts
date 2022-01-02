/*
 * Generated type guards for "DBPlayer.ts".
 * WARNING: Do not manually change this file.
 */
import { Datum } from '../utils/Datum';
import { DBPlayer } from './DBPlayer';

function evaluate(isCorrect: boolean, varName: string, expected: string, actual: any): boolean {
  if (!isCorrect) {
    console.error(`${varName} type mismatch, expected: ${expected}, found:`, actual);
  }
  return isCorrect;
}

export function isDBPlayer(obj: any, argumentName: string = 'dBPlayer'): obj is DBPlayer {
  return (
    ((obj !== null && typeof obj === 'object') || typeof obj === 'function') &&
    evaluate(typeof obj.id === 'number', `${argumentName}.id`, 'number', obj.id) &&
    evaluate(typeof obj.name === 'string', `${argumentName}.name`, 'string', obj.name) &&
    evaluate(
      obj.dateOfBirth instanceof Datum,
      `${argumentName}.dateOfBirth`,
      'import("./src/utils/Datum").Datum',
      obj.dateOfBirth,
    )
  );
}
