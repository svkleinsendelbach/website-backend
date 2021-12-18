import { PersonStartParser } from './WebsiteParser/PersonStartParser';
import { WebsiteFetcher } from './WebsiteFetcher';
import { PersonArtikelParser } from './WebsiteParser/PersonArtikelParser';
import { PersonBilderParser } from './WebsiteParser/PersonBilderParser';
import { WebserviceFetcher } from './WebserviceFetcher';
import * as functions from 'firebase-functions';
import { TeamStartParser } from './WebsiteParser/TeamStartParser';

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
    default:
      return undefined;
  }
}
