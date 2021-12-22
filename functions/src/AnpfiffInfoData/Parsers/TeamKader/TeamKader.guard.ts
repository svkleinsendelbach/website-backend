/*
 * Generated type guards for "TeamKader.ts".
 * WARNING: Do not manually change this file.
 */
import { isPersonParameters } from '../../Parameters/PersonParameters.guard';
import { TeamKader, TeamKaderPerson } from './TeamKader';

function evaluate(isCorrect: boolean, varName: string, expected: string, actual: any): boolean {
  if (!isCorrect) {
    console.error(`${varName} type mismatch, expected: ${expected}, found:`, actual);
  }
  return isCorrect;
}

export function isTeamKader(obj: any, argumentName: string = 'teamKader'): obj is TeamKader {
  return (
    ((obj !== null && typeof obj === 'object') || typeof obj === 'function') &&
    evaluate(
      typeof obj.kader === 'undefined' ||
        (((obj.kader !== null && typeof obj.kader === 'object') || typeof obj.kader === 'function') &&
          evaluate(
            typeof obj.kader.torwart === 'undefined' ||
              (Array.isArray(obj.kader.torwart) &&
                obj.kader.torwart.every((e: any) => isTeamKaderPerson(e) as boolean)),
            `${argumentName}.kader.torwart`,
            'import("./src/AnpfiffInfoData/Parsers/TeamKader/TeamKader").TeamKaderPerson[] | undefined',
            obj.kader.torwart,
          ) &&
          evaluate(
            typeof obj.kader.abwehr === 'undefined' ||
              (Array.isArray(obj.kader.abwehr) && obj.kader.abwehr.every((e: any) => isTeamKaderPerson(e) as boolean)),
            `${argumentName}.kader.abwehr`,
            'import("./src/AnpfiffInfoData/Parsers/TeamKader/TeamKader").TeamKaderPerson[] | undefined',
            obj.kader.abwehr,
          ) &&
          evaluate(
            typeof obj.kader.mittelfeld === 'undefined' ||
              (Array.isArray(obj.kader.mittelfeld) &&
                obj.kader.mittelfeld.every((e: any) => isTeamKaderPerson(e) as boolean)),
            `${argumentName}.kader.mittelfeld`,
            'import("./src/AnpfiffInfoData/Parsers/TeamKader/TeamKader").TeamKaderPerson[] | undefined',
            obj.kader.mittelfeld,
          ) &&
          evaluate(
            typeof obj.kader.sturm === 'undefined' ||
              (Array.isArray(obj.kader.sturm) && obj.kader.sturm.every((e: any) => isTeamKaderPerson(e) as boolean)),
            `${argumentName}.kader.sturm`,
            'import("./src/AnpfiffInfoData/Parsers/TeamKader/TeamKader").TeamKaderPerson[] | undefined',
            obj.kader.sturm,
          ) &&
          evaluate(
            typeof obj.kader.ohneAngabe === 'undefined' ||
              (Array.isArray(obj.kader.ohneAngabe) &&
                obj.kader.ohneAngabe.every((e: any) => isTeamKaderPerson(e) as boolean)),
            `${argumentName}.kader.ohneAngabe`,
            'import("./src/AnpfiffInfoData/Parsers/TeamKader/TeamKader").TeamKaderPerson[] | undefined',
            obj.kader.ohneAngabe,
          )),
      `${argumentName}.kader`,
      '{ torwart?: import("./src/AnpfiffInfoData/Parsers/TeamKader/TeamKader").TeamKaderPerson[] | undefined; abwehr?: import("/Users/steven/Documents/Programmierung/svkleinsendelbach-website-backend/functions/src/AnpfiffInfoData/Parsers/TeamKader/TeamKader").TeamKaderPerson[] | undefined; mittelfeld?: import("/Users/steven/Documents/Programmierung/svkleinsendelbach-website-backend/functions/src/AnpfiffInfoData/Parsers/TeamKader/TeamKader").TeamKaderPerson[] | undefined; sturm?: import("/Users/steven/Documents/Programmierung/svkleinsendelbach-website-backend/functions/src/AnpfiffInfoData/Parsers/TeamKader/TeamKader").TeamKaderPerson[] | undefined; ohneAngabe?: import("/Users/steven/Documents/Programmierung/svkleinsendelbach-website-backend/functions/src/AnpfiffInfoData/Parsers/TeamKader/TeamKader").TeamKaderPerson[] | undefined; } | undefined',
      obj.kader,
    ) &&
    evaluate(
      typeof obj.coach === 'undefined' ||
        (((obj.coach !== null && typeof obj.coach === 'object') || typeof obj.coach === 'function') &&
          evaluate(
            typeof obj.coach.imageId === 'undefined' || typeof obj.coach.imageId === 'number',
            `${argumentName}.coach.imageId`,
            'number | undefined',
            obj.coach.imageId,
          ) &&
          evaluate(
            typeof obj.coach.name === 'undefined' || typeof obj.coach.name === 'string',
            `${argumentName}.coach.name`,
            'string | undefined',
            obj.coach.name,
          ) &&
          evaluate(
            typeof obj.coach.personParameters === 'undefined' ||
              (isPersonParameters(obj.coach.personParameters) as boolean),
            `${argumentName}.coach.personParameters`,
            'import("./src/AnpfiffInfoData/Parameters/PersonParameters").PersonParameters | undefined',
            obj.coach.personParameters,
          ) &&
          evaluate(
            typeof obj.coach.age === 'undefined' || typeof obj.coach.age === 'number',
            `${argumentName}.coach.age`,
            'number | undefined',
            obj.coach.age,
          )),
      `${argumentName}.coach`,
      '{ imageId?: number | undefined; name?: string | undefined; personParameters?: import("./src/AnpfiffInfoData/Parameters/PersonParameters").PersonParameters | undefined; age?: number | undefined; } | undefined',
      obj.coach,
    ) &&
    evaluate(
      typeof obj.stab === 'undefined' ||
        (Array.isArray(obj.stab) &&
          obj.stab.every(
            (e: any, i0: number) =>
              ((e !== null && typeof e === 'object') || typeof e === 'function') &&
              evaluate(
                typeof e.imageId === 'undefined' || typeof e.imageId === 'number',
                `${argumentName}.stab[${i0}].imageId`,
                'number | undefined',
                e.imageId,
              ) &&
              evaluate(
                typeof e.function === 'undefined' || typeof e.function === 'string',
                `${argumentName}.stab[${i0}].function`,
                'string | undefined',
                e.function,
              ) &&
              evaluate(
                typeof e.name === 'undefined' || typeof e.name === 'string',
                `${argumentName}.stab[${i0}].name`,
                'string | undefined',
                e.name,
              ) &&
              evaluate(
                typeof e.personParameters === 'undefined' || (isPersonParameters(e.personParameters) as boolean),
                `${argumentName}.stab[${i0}].personParameters`,
                'import("./src/AnpfiffInfoData/Parameters/PersonParameters").PersonParameters | undefined',
                e.personParameters,
              ),
          )),
      `${argumentName}.stab`,
      '{ imageId?: number | undefined; function?: string | undefined; name?: string | undefined; personParameters?: import("./src/AnpfiffInfoData/Parameters/PersonParameters").PersonParameters | undefined; }[] | undefined',
      obj.stab,
    )
  );
}

export function isTeamKaderPerson(obj: any, argumentName: string = 'teamKaderPerson'): obj is TeamKaderPerson {
  return (
    ((obj !== null && typeof obj === 'object') || typeof obj === 'function') &&
    evaluate(
      typeof obj.imageId === 'undefined' || typeof obj.imageId === 'number',
      `${argumentName}.imageId`,
      'number | undefined',
      obj.imageId,
    ) &&
    evaluate(
      typeof obj.firstName === 'undefined' || typeof obj.firstName === 'string',
      `${argumentName}.firstName`,
      'string | undefined',
      obj.firstName,
    ) &&
    evaluate(
      typeof obj.lastName === 'undefined' || typeof obj.lastName === 'string',
      `${argumentName}.lastName`,
      'string | undefined',
      obj.lastName,
    ) &&
    evaluate(
      typeof obj.personParameters === 'undefined' || (isPersonParameters(obj.personParameters) as boolean),
      `${argumentName}.personParameters`,
      'import("./src/AnpfiffInfoData/Parameters/PersonParameters").PersonParameters | undefined',
      obj.personParameters,
    ) &&
    evaluate(
      typeof obj.age === 'undefined' || typeof obj.age === 'number',
      `${argumentName}.age`,
      'number | undefined',
      obj.age,
    ) &&
    evaluate(
      typeof obj.inSquad === 'undefined' || typeof obj.inSquad === 'number',
      `${argumentName}.inSquad`,
      'number | undefined',
      obj.inSquad,
    ) &&
    evaluate(
      typeof obj.goals === 'undefined' || typeof obj.goals === 'number',
      `${argumentName}.goals`,
      'number | undefined',
      obj.goals,
    ) &&
    evaluate(
      typeof obj.assists === 'undefined' || typeof obj.assists === 'number',
      `${argumentName}.assists`,
      'number | undefined',
      obj.assists,
    )
  );
}
