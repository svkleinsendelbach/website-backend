/*
 * Generated type guards for "PersonBilder.ts".
 * WARNING: Do not manually change this file.
 */
import { PersonBilder } from './PersonBilder';

function evaluate(isCorrect: boolean, varName: string, expected: string, actual: any): boolean {
  if (!isCorrect) {
    console.error(`${varName} type mismatch, expected: ${expected}, found:`, actual);
  }
  return isCorrect;
}

export function isPersonBilder(obj: any, argumentName: string = 'personBilder'): obj is PersonBilder {
  return (
    ((obj !== null && typeof obj === 'object') || typeof obj === 'function') &&
    evaluate(
      typeof obj.streckenId === 'undefined' || typeof obj.streckenId === 'number',
      `${argumentName}.streckenId`,
      'number | undefined',
      obj.streckenId,
    ) &&
    evaluate(
      typeof obj.streckenName === 'undefined' || typeof obj.streckenName === 'string',
      `${argumentName}.streckenName`,
      'string | undefined',
      obj.streckenName,
    ) &&
    evaluate(
      typeof obj.bilder === 'undefined' ||
        (Array.isArray(obj.bilder) &&
          obj.bilder.every(
            (e: any, i0: number) =>
              ((e !== null && typeof e === 'object') || typeof e === 'function') &&
              evaluate(
                typeof e.id === 'undefined' || typeof e.id === 'number',
                `${argumentName}.bilder[${i0}].id`,
                'number | undefined',
                e.id,
              ) &&
              evaluate(
                typeof e.index === 'undefined' || typeof e.index === 'number',
                `${argumentName}.bilder[${i0}].index`,
                'number | undefined',
                e.index,
              ),
          )),
      `${argumentName}.bilder`,
      '{ id?: number | undefined; index?: number | undefined; }[] | undefined',
      obj.bilder,
    )
  );
}
