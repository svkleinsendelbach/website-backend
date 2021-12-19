/*
 * Generated type guards for "PersonArtikel.ts".
 * WARNING: Do not manually change this file.
 */
import { PersonArtikel } from './PersonArtikel';

function evaluate(isCorrect: boolean, varName: string, expected: string, actual: any): boolean {
  if (!isCorrect) {
    console.error(`${varName} type mismatch, expected: ${expected}, found:`, actual);
  }
  return isCorrect;
}

export function isPersonArtikel(obj: any, argumentName: string = 'personArtikel'): obj is PersonArtikel {
  return (
    ((obj !== null && typeof obj === 'object') || typeof obj === 'function') &&
    evaluate(
      typeof obj.id === 'undefined' || typeof obj.id === 'number',
      `${argumentName}.id`,
      'number | undefined',
      obj.id,
    ) &&
    evaluate(
      typeof obj.date === 'undefined' || typeof obj.date === 'string',
      `${argumentName}.date`,
      'string | undefined',
      obj.date,
    ) &&
    evaluate(
      typeof obj.header === 'undefined' || typeof obj.header === 'string',
      `${argumentName}.header`,
      'string | undefined',
      obj.header,
    ) &&
    evaluate(
      typeof obj.subHeader === 'undefined' || typeof obj.subHeader === 'string',
      `${argumentName}.subHeader`,
      'string | undefined',
      obj.subHeader,
    ) &&
    evaluate(
      typeof obj.text === 'undefined' || typeof obj.text === 'string',
      `${argumentName}.text`,
      'string | undefined',
      obj.text,
    ) &&
    evaluate(
      typeof obj.autor === 'undefined' || typeof obj.autor === 'string',
      `${argumentName}.autor`,
      'string | undefined',
      obj.autor,
    ) &&
    evaluate(
      typeof obj.rubrik === 'undefined' || typeof obj.rubrik === 'string',
      `${argumentName}.rubrik`,
      'string | undefined',
      obj.rubrik,
    ) &&
    evaluate(
      typeof obj.imageId === 'undefined' || typeof obj.imageId === 'number',
      `${argumentName}.imageId`,
      'number | undefined',
      obj.imageId,
    )
  );
}
