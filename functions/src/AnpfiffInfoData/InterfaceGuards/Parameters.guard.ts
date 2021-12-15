/*
 * Generated type guards for "Parameters.ts".
 * WARNING: Do not manually change this file.
 */
import {
  PersonInfoParameters,
  TeamInfoParameters,
  ArtikelInfoParameters,
} from "../Interfaces/Parameters";

function evaluate(
  isCorrect: boolean,
  varName: string,
  expected: string,
  actual: any
): boolean {
  if (!isCorrect) {
    console.error(
      `${varName} type mismatch, expected: ${expected}, found:`,
      actual
    );
  }
  return isCorrect;
}

export function isPersonInfoParameters(
  obj: any,
  argumentName: string = "personInfoParameters"
): obj is PersonInfoParameters {
  return (
    ((obj !== null && typeof obj === "object") || typeof obj === "function") &&
    evaluate(
      typeof obj.spielkreis === "number",
      `${argumentName}.spielkreis`,
      "number",
      obj.spielkreis
    ) &&
    evaluate(
      typeof obj.personId === "number",
      `${argumentName}.personId`,
      "number",
      obj.personId
    )
  );
}

export function isTeamInfoParameters(
  obj: any,
  argumentName: string = "teamInfoParameters"
): obj is TeamInfoParameters {
  return (
    ((obj !== null && typeof obj === "object") || typeof obj === "function") &&
    evaluate(
      typeof obj.spielkreis === "number",
      `${argumentName}.spielkreis`,
      "number",
      obj.spielkreis
    ) &&
    evaluate(
      typeof obj.ligaId === "number",
      `${argumentName}.ligaId`,
      "number",
      obj.ligaId
    ) &&
    evaluate(
      typeof obj.teamId === "number",
      `${argumentName}.teamId`,
      "number",
      obj.teamId
    ) &&
    evaluate(
      typeof obj.vereinId === "number",
      `${argumentName}.vereinId`,
      "number",
      obj.vereinId
    ) &&
    evaluate(
      typeof obj.saisonId === "number",
      `${argumentName}.saisonId`,
      "number",
      obj.saisonId
    ) &&
    evaluate(
      typeof obj.men === "number",
      `${argumentName}.men`,
      "number",
      obj.men
    )
  );
}

export function isArtikelInfoParameters(
  obj: any,
  argumentName: string = "artikelInfoParameters"
): obj is ArtikelInfoParameters {
  return (
    ((obj !== null && typeof obj === "object") || typeof obj === "function") &&
    evaluate(
      typeof obj.spielkreis === "number",
      `${argumentName}.spielkreis`,
      "number",
      obj.spielkreis
    ) &&
    evaluate(
      typeof obj.btr === "number",
      `${argumentName}.btr`,
      "number",
      obj.btr
    )
  );
}
