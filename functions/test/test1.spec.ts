import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';
import fetch from 'cross-fetch';
import { parse } from 'fsp-xml-parser';
import DOMParser from 'dom-parser';
import { getAuth, signInWithEmailAndPassword, UserCredential } from 'firebase/auth';
import { firebaseConfig, testUser } from './firebaseConfig';
import { expect } from 'chai';
import { TeamStartParser } from '../src/AnpfiffInfoData/WebsiteParser/TeamStartParser';
import { PersonBilderParser } from '../src/AnpfiffInfoData/WebsiteParser/PersonBilderParser';

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app, 'europe-west1');
export const auth = getAuth();

export async function signInTestUser(): Promise<UserCredential> {
  return await signInWithEmailAndPassword(auth, testUser.email, testUser.password);
}

export async function callFunction(functionName: string, parameters: any | undefined = undefined): Promise<any> {
  return (await httpsCallable(functions, functionName)(parameters)).data;
}

export async function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve, _reject) => {
    setTimeout(() => {
      resolve();
    }, milliseconds);
  });
}

describe('test 1', () => {
  it('sub test 1', async () => {
    const o = {
      test: [],
    };
    console.log(JSON.parse(JSON.stringify(o)));
  });

  it('fetch webservice', async () => {
    const url =
      'http://www.anpfiff.info/Webservices/WS_Archiv.asmx/GetBilder?intSKID=2&intSaisID=0&intMonat=0&intRubID=0&intPersID=257472&intTmID=0&intVerID=0&intRowVon=1&intRowBis=16';
    const xml = await (await fetch(url)).text();
    const dom = parse(xml);
    const parser = new PersonBilderParser();
    const data = parser.parseWebservice(dom);
    console.log(JSON.stringify(data));
  });

  it('fetch website', async () => {
    const url = 'http://www.anpfiff.info/sites/team/start.aspx?SK=7&Lg=28&Tm=30675&Ver=294&Sais=123&Men=19';
    const html = await (await fetch(url)).text();
    const dom = new DOMParser().parseFromString(html);
    const parser = new TeamStartParser();
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

    console.log(JSON.stringify(result1.value));

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
});
