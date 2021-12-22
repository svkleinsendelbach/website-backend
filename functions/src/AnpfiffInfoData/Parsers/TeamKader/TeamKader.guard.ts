/*
 * Generated type guards for "TeamKader.ts".
 * WARNING: Do not manually change this file.
 */
import { isPersonParameters } from '../../Parameters/PersonParameters.guard';
import { TeamKader } from './TeamKader';

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
                obj.kader.torwart.every(
                  (e: any, i0: number) =>
                    ((e !== null && typeof e === 'object') || typeof e === 'function') &&
                    evaluate(
                      typeof e.imageId === 'undefined' || typeof e.imageId === 'number',
                      `${argumentName}.kader.torwart[${i0}].imageId`,
                      'number | undefined',
                      e.imageId,
                    ) &&
                    evaluate(
                      typeof e.firstName === 'undefined' || typeof e.firstName === 'string',
                      `${argumentName}.kader.torwart[${i0}].firstName`,
                      'string | undefined',
                      e.firstName,
                    ) &&
                    evaluate(
                      typeof e.lastName === 'undefined' || typeof e.lastName === 'string',
                      `${argumentName}.kader.torwart[${i0}].lastName`,
                      'string | undefined',
                      e.lastName,
                    ) &&
                    evaluate(
                      typeof e.personParameters === 'undefined' || (isPersonParameters(e.personParameters) as boolean),
                      `${argumentName}.kader.torwart[${i0}].personParameters`,
                      'import("./src/AnpfiffInfoData/Parameters/PersonParameters").PersonParameters | undefined',
                      e.personParameters,
                    ) &&
                    evaluate(
                      typeof e.age === 'undefined' || typeof e.age === 'number',
                      `${argumentName}.kader.torwart[${i0}].age`,
                      'number | undefined',
                      e.age,
                    ) &&
                    evaluate(
                      typeof e.inSquad === 'undefined' || typeof e.inSquad === 'number',
                      `${argumentName}.kader.torwart[${i0}].inSquad`,
                      'number | undefined',
                      e.inSquad,
                    ) &&
                    evaluate(
                      typeof e.goals === 'undefined' || typeof e.goals === 'number',
                      `${argumentName}.kader.torwart[${i0}].goals`,
                      'number | undefined',
                      e.goals,
                    ) &&
                    evaluate(
                      typeof e.assists === 'undefined' || typeof e.assists === 'number',
                      `${argumentName}.kader.torwart[${i0}].assists`,
                      'number | undefined',
                      e.assists,
                    ),
                )),
            `${argumentName}.kader.torwart`,
            'TeamKaderPerson[] | undefined',
            obj.kader.torwart,
          ) &&
          evaluate(
            typeof obj.kader.abwehr === 'undefined' ||
              (Array.isArray(obj.kader.abwehr) &&
                obj.kader.abwehr.every(
                  (e: any, i0: number) =>
                    ((e !== null && typeof e === 'object') || typeof e === 'function') &&
                    evaluate(
                      typeof e.imageId === 'undefined' || typeof e.imageId === 'number',
                      `${argumentName}.kader.abwehr[${i0}].imageId`,
                      'number | undefined',
                      e.imageId,
                    ) &&
                    evaluate(
                      typeof e.firstName === 'undefined' || typeof e.firstName === 'string',
                      `${argumentName}.kader.abwehr[${i0}].firstName`,
                      'string | undefined',
                      e.firstName,
                    ) &&
                    evaluate(
                      typeof e.lastName === 'undefined' || typeof e.lastName === 'string',
                      `${argumentName}.kader.abwehr[${i0}].lastName`,
                      'string | undefined',
                      e.lastName,
                    ) &&
                    evaluate(
                      typeof e.personParameters === 'undefined' || (isPersonParameters(e.personParameters) as boolean),
                      `${argumentName}.kader.abwehr[${i0}].personParameters`,
                      'import("./src/AnpfiffInfoData/Parameters/PersonParameters").PersonParameters | undefined',
                      e.personParameters,
                    ) &&
                    evaluate(
                      typeof e.age === 'undefined' || typeof e.age === 'number',
                      `${argumentName}.kader.abwehr[${i0}].age`,
                      'number | undefined',
                      e.age,
                    ) &&
                    evaluate(
                      typeof e.inSquad === 'undefined' || typeof e.inSquad === 'number',
                      `${argumentName}.kader.abwehr[${i0}].inSquad`,
                      'number | undefined',
                      e.inSquad,
                    ) &&
                    evaluate(
                      typeof e.goals === 'undefined' || typeof e.goals === 'number',
                      `${argumentName}.kader.abwehr[${i0}].goals`,
                      'number | undefined',
                      e.goals,
                    ) &&
                    evaluate(
                      typeof e.assists === 'undefined' || typeof e.assists === 'number',
                      `${argumentName}.kader.abwehr[${i0}].assists`,
                      'number | undefined',
                      e.assists,
                    ),
                )),
            `${argumentName}.kader.abwehr`,
            'TeamKaderPerson[] | undefined',
            obj.kader.abwehr,
          ) &&
          evaluate(
            typeof obj.kader.mittelfeld === 'undefined' ||
              (Array.isArray(obj.kader.mittelfeld) &&
                obj.kader.mittelfeld.every(
                  (e: any, i0: number) =>
                    ((e !== null && typeof e === 'object') || typeof e === 'function') &&
                    evaluate(
                      typeof e.imageId === 'undefined' || typeof e.imageId === 'number',
                      `${argumentName}.kader.mittelfeld[${i0}].imageId`,
                      'number | undefined',
                      e.imageId,
                    ) &&
                    evaluate(
                      typeof e.firstName === 'undefined' || typeof e.firstName === 'string',
                      `${argumentName}.kader.mittelfeld[${i0}].firstName`,
                      'string | undefined',
                      e.firstName,
                    ) &&
                    evaluate(
                      typeof e.lastName === 'undefined' || typeof e.lastName === 'string',
                      `${argumentName}.kader.mittelfeld[${i0}].lastName`,
                      'string | undefined',
                      e.lastName,
                    ) &&
                    evaluate(
                      typeof e.personParameters === 'undefined' || (isPersonParameters(e.personParameters) as boolean),
                      `${argumentName}.kader.mittelfeld[${i0}].personParameters`,
                      'import("./src/AnpfiffInfoData/Parameters/PersonParameters").PersonParameters | undefined',
                      e.personParameters,
                    ) &&
                    evaluate(
                      typeof e.age === 'undefined' || typeof e.age === 'number',
                      `${argumentName}.kader.mittelfeld[${i0}].age`,
                      'number | undefined',
                      e.age,
                    ) &&
                    evaluate(
                      typeof e.inSquad === 'undefined' || typeof e.inSquad === 'number',
                      `${argumentName}.kader.mittelfeld[${i0}].inSquad`,
                      'number | undefined',
                      e.inSquad,
                    ) &&
                    evaluate(
                      typeof e.goals === 'undefined' || typeof e.goals === 'number',
                      `${argumentName}.kader.mittelfeld[${i0}].goals`,
                      'number | undefined',
                      e.goals,
                    ) &&
                    evaluate(
                      typeof e.assists === 'undefined' || typeof e.assists === 'number',
                      `${argumentName}.kader.mittelfeld[${i0}].assists`,
                      'number | undefined',
                      e.assists,
                    ),
                )),
            `${argumentName}.kader.mittelfeld`,
            'TeamKaderPerson[] | undefined',
            obj.kader.mittelfeld,
          ) &&
          evaluate(
            typeof obj.kader.sturm === 'undefined' ||
              (Array.isArray(obj.kader.sturm) &&
                obj.kader.sturm.every(
                  (e: any, i0: number) =>
                    ((e !== null && typeof e === 'object') || typeof e === 'function') &&
                    evaluate(
                      typeof e.imageId === 'undefined' || typeof e.imageId === 'number',
                      `${argumentName}.kader.sturm[${i0}].imageId`,
                      'number | undefined',
                      e.imageId,
                    ) &&
                    evaluate(
                      typeof e.firstName === 'undefined' || typeof e.firstName === 'string',
                      `${argumentName}.kader.sturm[${i0}].firstName`,
                      'string | undefined',
                      e.firstName,
                    ) &&
                    evaluate(
                      typeof e.lastName === 'undefined' || typeof e.lastName === 'string',
                      `${argumentName}.kader.sturm[${i0}].lastName`,
                      'string | undefined',
                      e.lastName,
                    ) &&
                    evaluate(
                      typeof e.personParameters === 'undefined' || (isPersonParameters(e.personParameters) as boolean),
                      `${argumentName}.kader.sturm[${i0}].personParameters`,
                      'import("./src/AnpfiffInfoData/Parameters/PersonParameters").PersonParameters | undefined',
                      e.personParameters,
                    ) &&
                    evaluate(
                      typeof e.age === 'undefined' || typeof e.age === 'number',
                      `${argumentName}.kader.sturm[${i0}].age`,
                      'number | undefined',
                      e.age,
                    ) &&
                    evaluate(
                      typeof e.inSquad === 'undefined' || typeof e.inSquad === 'number',
                      `${argumentName}.kader.sturm[${i0}].inSquad`,
                      'number | undefined',
                      e.inSquad,
                    ) &&
                    evaluate(
                      typeof e.goals === 'undefined' || typeof e.goals === 'number',
                      `${argumentName}.kader.sturm[${i0}].goals`,
                      'number | undefined',
                      e.goals,
                    ) &&
                    evaluate(
                      typeof e.assists === 'undefined' || typeof e.assists === 'number',
                      `${argumentName}.kader.sturm[${i0}].assists`,
                      'number | undefined',
                      e.assists,
                    ),
                )),
            `${argumentName}.kader.sturm`,
            'TeamKaderPerson[] | undefined',
            obj.kader.sturm,
          ) &&
          evaluate(
            typeof obj.kader.ohneAngabe === 'undefined' ||
              (Array.isArray(obj.kader.ohneAngabe) &&
                obj.kader.ohneAngabe.every(
                  (e: any, i0: number) =>
                    ((e !== null && typeof e === 'object') || typeof e === 'function') &&
                    evaluate(
                      typeof e.imageId === 'undefined' || typeof e.imageId === 'number',
                      `${argumentName}.kader.ohneAngabe[${i0}].imageId`,
                      'number | undefined',
                      e.imageId,
                    ) &&
                    evaluate(
                      typeof e.firstName === 'undefined' || typeof e.firstName === 'string',
                      `${argumentName}.kader.ohneAngabe[${i0}].firstName`,
                      'string | undefined',
                      e.firstName,
                    ) &&
                    evaluate(
                      typeof e.lastName === 'undefined' || typeof e.lastName === 'string',
                      `${argumentName}.kader.ohneAngabe[${i0}].lastName`,
                      'string | undefined',
                      e.lastName,
                    ) &&
                    evaluate(
                      typeof e.personParameters === 'undefined' || (isPersonParameters(e.personParameters) as boolean),
                      `${argumentName}.kader.ohneAngabe[${i0}].personParameters`,
                      'import("./src/AnpfiffInfoData/Parameters/PersonParameters").PersonParameters | undefined',
                      e.personParameters,
                    ) &&
                    evaluate(
                      typeof e.age === 'undefined' || typeof e.age === 'number',
                      `${argumentName}.kader.ohneAngabe[${i0}].age`,
                      'number | undefined',
                      e.age,
                    ) &&
                    evaluate(
                      typeof e.inSquad === 'undefined' || typeof e.inSquad === 'number',
                      `${argumentName}.kader.ohneAngabe[${i0}].inSquad`,
                      'number | undefined',
                      e.inSquad,
                    ) &&
                    evaluate(
                      typeof e.goals === 'undefined' || typeof e.goals === 'number',
                      `${argumentName}.kader.ohneAngabe[${i0}].goals`,
                      'number | undefined',
                      e.goals,
                    ) &&
                    evaluate(
                      typeof e.assists === 'undefined' || typeof e.assists === 'number',
                      `${argumentName}.kader.ohneAngabe[${i0}].assists`,
                      'number | undefined',
                      e.assists,
                    ),
                )),
            `${argumentName}.kader.ohneAngabe`,
            'TeamKaderPerson[] | undefined',
            obj.kader.ohneAngabe,
          )),
      `${argumentName}.kader`,
      '{ torwart?: TeamKaderPerson[] | undefined; abwehr?: TeamKaderPerson[] | undefined; mittelfeld?: TeamKaderPerson[] | undefined; sturm?: TeamKaderPerson[] | undefined; ohneAngabe?: TeamKaderPerson[] | undefined; } | undefined',
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
