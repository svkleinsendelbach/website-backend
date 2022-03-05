import fetch from 'cross-fetch';
import DOMParser from 'dom-parser';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

import { DebugProperties } from '../DebugProperties';
import { DateOffset, isDateRecent, normalizeRefPathComponent } from '../utils';

type AnpfiffInfoParametersDBPath = 'teamParameters/first-team' | 'teamParameters/second-team';

export class WebsiteFetcher<Params, T> {
  private url!: string;

  public constructor(
    private readonly parser: WebsiteFetcher.Parser<Params, T>,
    private readonly debugProperties: DebugProperties,
  ) {}

  public async intitialize(params: Params | AnpfiffInfoParametersDBPath) {
    let parameters: Params;
    if (this.parser.parametersGuard(params)) {
      parameters = params;
    } else if (typeof params === 'string') {
      parameters = await this.getParameters(params);
    } else {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Invalid anpfiff.info parameters: ${JSON.stringify(params)}`,
      );
    }
    this.url = this.parser.getUrl(parameters);
  }

  private async getParameters(path: AnpfiffInfoParametersDBPath): Promise<Params> {
    const paramsRef = admin.database().ref(`anpfiffParameters/${path}`);
    const snapshot = await paramsRef.once('value');
    if (!snapshot.exists()) {
      throw new functions.https.HttpsError('invalid-argument', `Couldn't get parameters from path: ${path}`);
    }
    const params = snapshot.val();
    if (!this.parser.parametersGuard(params)) {
      throw new functions.https.HttpsError('internal', `Couldn't get parameters from path: ${path}`);
    }
    return params;
  }

  public async fetch(): Promise<{
    fetchTimestamp: string;
    origin: 'fetch' | 'cache';
    value: T;
  }> {
    const cachedValue = await this.getCachedValue();
    if (cachedValue !== 'noCachedValue') {
      return cachedValue;
    }
    let value = await this.fetchAndParseWebsite();
    value = JSON.parse(JSON.stringify(value));
    this.setCache(value);
    return {
      fetchTimestamp: new Date().toISOString(),
      origin: 'fetch',
      value: value,
    };
  }

  private async getCachedValue(): Promise<
    | {
        fetchTimestamp: string;
        origin: 'cache';
        value: T;
      }
    | 'noCachedValue'
  > {
    const cacheRef = admin.database().ref(`caches/${normalizeRefPathComponent(this.url)}`);
    const snapshot = await cacheRef.once('value');
    if (snapshot.exists()) {
      const data = snapshot.val();
      if (
        data !== null &&
        typeof data === 'object' &&
        typeof data.timestamp === 'string' &&
        typeof data.value === 'object'
      ) {
        const timestamp = new Date(data.timestamp);
        const dateOffset: DateOffset = this.debugProperties.dateOffset ?? this.parser.dateOffset;
        if (
          !isNaN(timestamp.getTime()) &&
          isDateRecent(timestamp, dateOffset) &&
          this.parser.interfaceGuard(data.value)
        ) {
          return {
            fetchTimestamp: timestamp.toISOString(),
            origin: 'cache',
            value: data.value,
          };
        }
      }
    }
    return 'noCachedValue';
  }

  private async fetchAndParseWebsite(): Promise<T> {
    const html = await (await fetch(this.url)).text();
    const dom = new DOMParser().parseFromString(html);
    return this.parser.parseWebsite(dom);
  }

  private async setCache(value: T): Promise<void> {
    const cacheRef = admin.database().ref(`caches/${normalizeRefPathComponent(this.url)}`);
    await cacheRef.set({
      timestamp: new Date().toISOString(),
      value: value,
    });
  }
}

export namespace WebsiteFetcher {
  export interface Parser<Params, T> {
    parametersGuard: (obj: any) => obj is Params;
    getUrl: (parameters: Params) => string;
    dateOffset: DateOffset;
    interfaceGuard: (obj: any) => obj is T;
    parseWebsite: (dom: DOMParser.Dom) => T;
  }
}
