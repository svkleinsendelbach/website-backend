import * as functions from 'firebase-functions';

import { WebserviceFetcher } from './Fetchers/WebserviceFetcher';
import { WebsiteFetcher } from './Fetchers/WebsiteFetcher';
import { PersonArtikelParser } from './Parsers/PersonArtikel/PersonArtikelParser';
import { PersonBilderParser } from './Parsers/PersonBilder/PersonBilderParser';
import { PersonStartParser } from './Parsers/PersonStart/PersonStartParser';
import { TeamArtikelParser } from './Parsers/TeamArtikel/TeamArtikelParser';
import { TeamBilderParser } from './Parsers/TeamBilder/TeamBilderParser';
import { TeamStartParser } from './Parsers/TeamStart/TeamStartParser';

export async function getAnpfiffInfoData(data: any): Promise<any> {
  const websiteParser = getWebsiteParser(data.website);
  if (websiteParser != undefined) {
    const fetcher = new WebsiteFetcher(websiteParser, data.parameters, data.debug ?? false);
    return await fetcher.fetch();
  }
  const webserviceParser = getWebserviceFetcher(data.website);
  if (webserviceParser != undefined) {
    const fetcher = new WebserviceFetcher(webserviceParser, data.parameters, data.debug ?? false);
    return await fetcher.fetch();
  }
  throw new functions.https.HttpsError('invalid-argument', `Invalid anpfiff.info website: ${data.website}`);
}

function getWebsiteParser(website: string): WebsiteFetcher.Parser<any, any> | undefined {
  switch (website) {
    case 'person/start':
      return new PersonStartParser();
    case 'team/start':
      return new TeamStartParser();
    default:
      return undefined;
  }
}

function getWebserviceFetcher(website: string): WebserviceFetcher.Parser<any, any> | undefined {
  switch (website) {
    case 'person/artikel':
      return new PersonArtikelParser();
    case 'person/bilder':
      return new PersonBilderParser();
    case 'team/artikel':
      return new TeamArtikelParser();
    case 'team/bilder':
      return new TeamBilderParser();
    default:
      return undefined;
  }
}
