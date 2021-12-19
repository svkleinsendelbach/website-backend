/*
 * Generated type guards for "utils.ts".
 * WARNING: Do not manually change this file.
 */
import { DateOffset } from './utils';

function evaluate(isCorrect: boolean, varName: string, expected: string, actual: any): boolean {
  if (!isCorrect) {
    console.error(`${varName} type mismatch, expected: ${expected}, found:`, actual);
  }
  return isCorrect;
}

export function isDateOffset(obj: any, argumentName: string = 'dateOffset'): obj is DateOffset {
  return (
    ((obj !== null && typeof obj === 'object') || typeof obj === 'function') &&
    evaluate(
      typeof obj.day === 'undefined' || typeof obj.day === 'number',
      `${argumentName}.day`,
      'number | undefined',
      obj.day,
    ) &&
    evaluate(
      typeof obj.hour === 'undefined' || typeof obj.hour === 'number',
      `${argumentName}.hour`,
      'number | undefined',
      obj.hour,
    ) &&
    evaluate(
      typeof obj.minute === 'undefined' || typeof obj.minute === 'number',
      `${argumentName}.minute`,
      'number | undefined',
      obj.minute,
    ) &&
    evaluate(
      typeof obj.second === 'undefined' || typeof obj.second === 'number',
      `${argumentName}.second`,
      'number | undefined',
      obj.second,
    )
  );
}
