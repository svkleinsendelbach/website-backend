/*
 * Generated type guards for "DebugProperties.ts".
 * WARNING: Do not manually change this file.
 */
import { isDateOffset } from './utils.guard';
import { RawValue } from './DebugProperties';

function evaluate(isCorrect: boolean, varName: string, expected: string, actual: any): boolean {
  if (!isCorrect) {
    console.error(`${varName} type mismatch, expected: ${expected}, found:`, actual);
  }
  return isCorrect;
}

export function isDebugPropertiesRawValue(obj: any, argumentName: string = 'rawValue'): obj is RawValue {
  return (
    obj === false ||
    obj === true ||
    (((obj !== null && typeof obj === 'object') || typeof obj === 'function') &&
      evaluate(
        typeof obj.dateOffset === 'undefined' || (isDateOffset(obj.dateOffset) as boolean),
        `${argumentName}.dateOffset`,
        'import("./src/AnpfiffInfoData/utils").DateOffset | undefined',
        obj.dateOffset,
      ))
  );
}
