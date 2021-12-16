/*
 * Generated type guards for "PersonBilder.ts".
 * WARNING: Do not manually change this file.
 */
import { PersonBilder } from "../Interfaces/PersonBilder";

export function isPersonBilder(
  obj: any,
  _argumentName?: string
): obj is PersonBilder {
  return (
    ((obj !== null && typeof obj === "object") || typeof obj === "function") &&
    (typeof obj.streckenId === "undefined" ||
      typeof obj.streckenId === "number") &&
    (typeof obj.streckenName === "undefined" ||
      typeof obj.streckenName === "string") &&
    (typeof obj.bilder === "undefined" ||
      (Array.isArray(obj.bilder) &&
        obj.bilder.every(
          (e: any) =>
            ((e !== null && typeof e === "object") ||
              typeof e === "function") &&
            (typeof e.id === "undefined" || typeof e.id === "number") &&
            (typeof e.index === "undefined" || typeof e.index === "number")
        )))
  );
}
