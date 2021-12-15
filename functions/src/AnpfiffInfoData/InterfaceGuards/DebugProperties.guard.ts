/*
 * Generated type guards for "DebugProperties.ts".
 * WARNING: Do not manually change this file.
 */
import { RawValue } from "../DebugProperties";

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

export function isDebugPropertiesRawValue(
  obj: any,
  argumentName: string = "rawValue"
): obj is RawValue {
  return (
    obj === false ||
    obj === true ||
    (((obj !== null && typeof obj === "object") || typeof obj === "function") &&
      evaluate(
        typeof obj.dateOffset === "undefined" ||
          (((obj.dateOffset !== null && typeof obj.dateOffset === "object") ||
            typeof obj.dateOffset === "function") &&
            evaluate(
              typeof obj.dateOffset.day === "undefined" ||
                typeof obj.dateOffset.day === "number",
              `${argumentName}.dateOffset.day`,
              "number | undefined",
              obj.dateOffset.day
            ) &&
            evaluate(
              typeof obj.dateOffset.hour === "undefined" ||
                typeof obj.dateOffset.hour === "number",
              `${argumentName}.dateOffset.hour`,
              "number | undefined",
              obj.dateOffset.hour
            ) &&
            evaluate(
              typeof obj.dateOffset.minute === "undefined" ||
                typeof obj.dateOffset.minute === "number",
              `${argumentName}.dateOffset.minute`,
              "number | undefined",
              obj.dateOffset.minute
            ) &&
            evaluate(
              typeof obj.dateOffset.second === "undefined" ||
                typeof obj.dateOffset.second === "number",
              `${argumentName}.dateOffset.second`,
              "number | undefined",
              obj.dateOffset.second
            )),
        `${argumentName}.dateOffset`,
        'import("./src/AnpfiffInfoData/utils").DateOffset | undefined',
        obj.dateOffset
      ))
  );
}
