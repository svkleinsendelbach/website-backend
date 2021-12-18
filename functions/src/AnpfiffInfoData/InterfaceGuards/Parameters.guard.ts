/*
 * Generated type guards for "Parameters.ts".
 * WARNING: Do not manually change this file.
 */
import {
  PersonInfoParameters,
  TeamInfoParameters,
  ArtikelInfoParameters,
  LigaInfoParameters,
  ResultInfoParameters,
} from "../Interfaces/Parameters";

export function isPersonInfoParameters(
  obj: any,
  _argumentName?: string
): obj is PersonInfoParameters {
  return (
    ((obj !== null && typeof obj === "object") || typeof obj === "function") &&
    typeof obj.spielkreis === "number" &&
    typeof obj.personId === "number"
  );
}

export function isTeamInfoParameters(
  obj: any,
  _argumentName?: string
): obj is TeamInfoParameters {
  return (
    ((obj !== null && typeof obj === "object") || typeof obj === "function") &&
    typeof obj.spielkreis === "number" &&
    typeof obj.ligaId === "number" &&
    typeof obj.teamId === "number" &&
    typeof obj.vereinId === "number" &&
    typeof obj.saisonId === "number" &&
    typeof obj.men === "number"
  );
}

export function isArtikelInfoParameters(
  obj: any,
  _argumentName?: string
): obj is ArtikelInfoParameters {
  return (
    ((obj !== null && typeof obj === "object") || typeof obj === "function") &&
    typeof obj.spielkreis === "number" &&
    typeof obj.btr === "number"
  );
}

export function isLigaInfoParameters(
  obj: any,
  _argumentName?: string
): obj is LigaInfoParameters {
  return (
    ((obj !== null && typeof obj === "object") || typeof obj === "function") &&
    typeof obj.spielkreis === "number" &&
    typeof obj.rubrik === "number" &&
    typeof obj.liga === "number" &&
    typeof obj.saison === "number"
  );
}

export function isResultInfoParameters(
  obj: any,
  _argumentName?: string
): obj is ResultInfoParameters {
  return (
    ((obj !== null && typeof obj === "object") || typeof obj === "function") &&
    typeof obj.spielkreis === "number" &&
    typeof obj.liga === "number" &&
    typeof obj.spiel === "number" &&
    typeof obj.verein === "number" &&
    typeof obj.teamHeim === "number" &&
    typeof obj.teamAway === "number" &&
    typeof obj.top === "number" &&
    typeof obj.ticker === "number" &&
    typeof obj.men === "number"
  );
}
