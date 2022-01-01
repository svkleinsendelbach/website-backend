import { expect } from 'chai';
import fetch from 'cross-fetch';
import DOMParser from 'dom-parser';
import { parse } from 'fsp-xml-parser';

import { LigaStartParser } from '../src/AnpfiffInfoData/Parsers/LigaStart/LigaStartParser';
import { PersonArtikelParser } from '../src/AnpfiffInfoData/Parsers/PersonArtikel/PersonArtikelParser';
import { callFunction, wait } from './utils';

describe('anpfiffInfoData', () => {
  it('sub test', async () => {
    const o = {
      test: [],
    };
    console.log(JSON.parse(JSON.stringify(o)));
  });

  it('fetch webservice', async () => {
    const url =
      'http://www.anpfiff.info/Webservices/WS_Archiv.asmx/GetCMSArchivArtikel?intSKID=2&intSaisID=123&intMonat=0&intRubID=0&intPersID=0&intTmID=30675&intVerID=294&intRowVon=1&intRowBis=6';
    const xml = await (await fetch(url)).text();
    const dom = parse(xml);
    const parser = new PersonArtikelParser();
    const data = parser.parseWebservice(dom);
    console.log(data);
  });

  it('fetch website', async () => {
    const url = 'http://www.anpfiff.info/sites/liga/start.aspx?SK=2&Rub=41&Lg=28&Sais=123&Men=25';
    const html = await (await fetch(url)).text();
    const dom = new DOMParser().parseFromString(html);
    const parser = new LigaStartParser();
    const data = parser.parseWebsite(dom);
    console.log(data);
  });

  async function testAnpfiffInfoFetcher(
    website: string,
    parameters: any,
    additionalExpect?: (result: any) => void,
  ): Promise<void> {
    await callFunction('deleteAllCaches');
    await wait(5_000);

    const result1 = await callFunction('getAnpfiffInfoData', {
      website: website,
      parameters: parameters,
      debug: {
        dateOffset: { second: 30 },
      },
    });
    expect(result1.origin).to.be.equal('fetch');
    additionalExpect?.(result1);

    console.log(JSON.stringify(result1.value, undefined, 2));

    const result2 = await callFunction('getAnpfiffInfoData', {
      website: website,
      parameters: parameters,
      debug: {
        dateOffset: { second: 30 },
      },
    });
    expect(result2.origin).to.be.equal('cache');
    additionalExpect?.(result2);
    expect(result2.value).to.be.deep.equal(result1.value);

    await wait(31_000);

    const result3 = await callFunction('getAnpfiffInfoData', {
      website: website,
      parameters: parameters,
      debug: {
        dateOffset: { second: 30 },
      },
    });
    expect(result3.origin).to.be.equal('fetch');
    additionalExpect?.(result3);
    expect(result3.value).to.be.deep.equal(result1.value);
  }

  it('person/start', async () => {
    await testAnpfiffInfoFetcher('person/start', {
      spielkreis: 2,
      personId: 284461,
    });
  });

  it('person/artikel', async () => {
    await testAnpfiffInfoFetcher(
      'person/artikel',
      {
        spielkreis: 2,
        personId: 205271,
        rowVon: 1,
        rowBis: 5,
      },
      result => {
        expect(result.hasMoreData).to.be.true;
        expect(result.value).to.satisfy(Array.isArray);
        expect(result.value.length).to.be.equal(5);
      },
    );
  });

  it('person/bilder', async () => {
    await testAnpfiffInfoFetcher(
      'person/bilder',
      {
        spielkreis: 2,
        personId: 257472,
        rowVon: 1,
        rowBis: 5,
      },
      result => {
        expect(result.hasMoreData).to.be.false;
        expect(result.value).to.satisfy(Array.isArray);
        expect(result.value.length).to.be.equal(5);
      },
    );
  });

  it('team/start', async () => {
    await testAnpfiffInfoFetcher('team/start', {
      spielkreis: 2,
      ligaId: 28,
      teamId: 30675,
      vereinId: 294,
      saisonId: 123,
      men: 19,
    });
  });

  it('team/artikel', async () => {
    await testAnpfiffInfoFetcher(
      'team/artikel',
      {
        spielkreis: 2,
        ligaId: 28,
        teamId: 30675,
        vereinId: 294,
        saisonId: 123,
        men: 19,
        rowVon: 1,
        rowBis: 5,
      },
      result => {
        expect(result.hasMoreData).to.be.false;
        expect(result.value).to.satisfy(Array.isArray);
        expect(result.value.length).to.be.equal(2);
      },
    );
  });

  it('team/bilder', async () => {
    await testAnpfiffInfoFetcher(
      'team/bilder',
      {
        spielkreis: 2,
        ligaId: 28,
        teamId: 30675,
        vereinId: 294,
        saisonId: 123,
        men: 19,
        rowVon: 1,
        rowBis: 5,
      },
      result => {
        expect(result.hasMoreData).to.be.false;
        expect(result.value).to.satisfy(Array.isArray);
        expect(result.value.length).to.be.equal(1);
      },
    );
  });

  it('team/kader', async () => {
    await testAnpfiffInfoFetcher('team/kader', {
      spielkreis: 2,
      ligaId: 28,
      teamId: 30675,
      vereinId: 294,
      saisonId: 123,
      men: 19,
    });
  });

  it('team/spiele', async () => {
    await testAnpfiffInfoFetcher('team/spiele', {
      spielkreis: 2,
      ligaId: 28,
      teamId: 30675,
      vereinId: 294,
      saisonId: 123,
      men: 19,
    });
  });

  it('liga/start', async () => {
    await testAnpfiffInfoFetcher('liga/start', {
      spielkreis: 2,
      rubrik: 41,
      liga: 28,
      saison: 123,
      men: 25,
    });
  });
});
