import { normalizeRefPathComponent, isDateRecent, DateOffset } from "./utils";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import fetch from "cross-fetch";
import { parse, XmlDocument } from "fsp-xml-parser";
import { DebugProperties } from "./DebugProperties";

export class WebserviceFetcher<Params, T> {
  private readonly url: string;

  private readonly expectedLength = Number.POSITIVE_INFINITY;

  public constructor(
    private readonly parser: WebserviceFetcher.Parser<Params, T>,
    params: Params & { rowVon: number; rowBis: number },
    private readonly debugProperties: DebugProperties
  ) {
    if (
      typeof params.rowVon != "number" ||
      typeof params.rowBis != "number" ||
      !parser.parametersGuard(params)
    ) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        `Invalid anpfiff.info parameters: ${JSON.stringify(params)}`
      );
    }
    this.expectedLength = params.rowBis - params.rowVon;
    this.url = parser.getUrl(params);
  }

  public async fetch(): Promise<{
    fetchTimestamp: string;
    origin: "fetch" | "cache";
    hasMoreData: boolean;
    value: T[];
  }> {
    const cachedValue = await this.getCachedValue();
    if (cachedValue !== "noCachedValue") {
      return cachedValue;
    }
    let value = await this.fetchAndParseWebservice();
    value = JSON.parse(JSON.stringify(value));
    this.setCache(value);
    return {
      fetchTimestamp: new Date().toISOString(),
      origin: "fetch",
      hasMoreData: value.hasMoreData,
      value: value.value,
    };
  }

  private async getCachedValue(): Promise<
    | {
        fetchTimestamp: string;
        origin: "cache";
        hasMoreData: boolean;
        value: T[];
      }
    | "noCachedValue"
  > {
    const cacheRef = admin
      .database()
      .ref(`caches/${normalizeRefPathComponent(this.url)}`);
    const snapshot = await cacheRef.once("value");
    if (snapshot.exists()) {
      const data = snapshot.val();
      if (
        data !== null &&
        typeof data === "object" &&
        typeof data.timestamp === "string" &&
        typeof data.value === "object" &&
        typeof data.value.hasMoreData === "boolean"
      ) {
        const timestamp = new Date(data.timestamp);
        const dateOffset: DateOffset =
          this.debugProperties.dateOffset ?? this.parser.dateOffset;
        if (
          !isNaN(timestamp.getTime()) &&
          isDateRecent(timestamp, dateOffset) &&
          Array.isArray(data.value.value) &&
          data.value.value.every((v: any) => this.parser.interfaceGuard(v))
        ) {
          return {
            fetchTimestamp: timestamp.toISOString(),
            origin: "cache",
            hasMoreData: data.value.hasMoreData,
            value: data.value.value,
          };
        }
      }
    }
    return "noCachedValue";
  }

  private async fetchAndParseWebservice(): Promise<{
    hasMoreData: boolean;
    value: T[];
  }> {
    const xml = await (await fetch(this.url)).text();
    const dom = parse(xml);
    const list = this.parser.parseWebservice(dom) ?? [];
    const hasMoreData = list.length > this.expectedLength;
    return {
      hasMoreData: hasMoreData,
      value: hasMoreData ? list.slice(0, -1) : list,
    };
  }

  private async setCache(value: {
    hasMoreData: boolean;
    value: T[];
  }): Promise<void> {
    const cacheRef = admin
      .database()
      .ref(`caches/${normalizeRefPathComponent(this.url)}`);
    await cacheRef.set({
      timestamp: new Date().toISOString(),
      value: value,
    });
  }
}

export namespace WebserviceFetcher {
  export interface Parser<Params, T> {
    parametersGuard: (obj: any) => obj is Params;
    getUrl: (parameters: Params & { rowVon: number; rowBis: number }) => string;
    dateOffset: DateOffset;
    interfaceGuard: (obj: any) => obj is T;
    parseWebservice: (dom: XmlDocument) => T[] | undefined;
  }
}
