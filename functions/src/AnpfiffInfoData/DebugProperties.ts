import { isDebugPropertiesRawValue } from "./InterfaceGuards/DebugProperties.guard";
import { DateOffset } from "./utils";

export class DebugProperties {
  private static DEFAULT_RAW_VALUES = {
    dateOffset: { minute: 5 },
  };

  private rawValue: RawValue;

  public constructor(rawValue: any) {
    if (isDebugPropertiesRawValue(rawValue)) {
      this.rawValue = rawValue;
    } else {
      this.rawValue = false;
    }
  }

  public get ["dateOffset"](): DateOffset | undefined {
    if (typeof this.rawValue == "boolean") {
      if (this.rawValue) {
        return DebugProperties.DEFAULT_RAW_VALUES.dateOffset;
      }
      return undefined;
    }
    return this.rawValue.dateOffset;
  }
}

/** @see {isDebugPropertiesRawValue} ts-auto-guard:type-guard */
export type RawValue =
  | {
      dateOffset?: DateOffset;
    }
  | boolean;
