import { initializeApp } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";
import fetch from "cross-fetch";
import { parse } from "fsp-xml-parser";
import { PersonArtikelParser } from "../src/AnpfiffInfoData/WebsiteParser/PersonArtikelParser";
// import { getDatabase } from "firebase/database";
import {
  getAuth,
  signInWithEmailAndPassword,
  UserCredential,
} from "firebase/auth";
import { firebaseConfig, testUser } from "./firebaseConfig";
import { expect } from "chai";

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app, "europe-west1");
// const database = getDatabase(app);
export const auth = getAuth();

export async function signInTestUser(): Promise<UserCredential> {
  return await signInWithEmailAndPassword(
    auth,
    testUser.email,
    testUser.password
  );
}

export async function callFunction(
  functionName: string,
  parameters: any | undefined = undefined
): Promise<any> {
  return (await httpsCallable(functions, functionName)(parameters)).data;
}

export async function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve, _reject) => {
    setTimeout(() => {
      resolve();
    }, milliseconds);
  });
}

describe("test 1", () => {
  it("sub test 1", async () => {
    const url =
      "http://www.anpfiff.info/Webservices/WS_Archiv.asmx/GetCMSArchivArtikel?intSKID=2&intSaisID=0&intMonat=0&intRubID=0&intPersID=205271&intTmID=0&intVerID=0&intRowVon=1&intRowBis=16";
    const xml = await (await fetch(url)).text();
    const dom = parse(xml);
    const parser = new PersonArtikelParser();
    const data = parser.parseWebservice(
      dom,
      "http://www.anpfiff.info/sites/artikel"
    );
    console.log(data);
  });

  it("sub test 2", async () => {
    const o = {
      test: [],
    };
    console.log(JSON.parse(JSON.stringify(o)));
  });

  it("person/start", async () => {
    await callFunction("deleteAllCaches");
    await wait(5_000);

    const result1 = await callFunction("getAnpfiffInfoData", {
      website: "person/start",
      parameters: {
        spielkreis: 2,
        personId: 284461,
      },
      debug: {
        dateOffset: { second: 30 },
      },
    });
    expect(result1.origin).to.be.equal("fetch");

    console.log(JSON.stringify(result1.value));

    const result2 = await callFunction("getAnpfiffInfoData", {
      website: "person/start",
      parameters: {
        spielkreis: 2,
        personId: 284461,
      },
      debug: {
        dateOffset: { second: 30 },
      },
    });
    expect(result2.origin).to.be.equal("cache");
    expect(result2.value).to.be.deep.equal(result1.value);

    await wait(31_000);

    const result3 = await callFunction("getAnpfiffInfoData", {
      website: "person/start",
      parameters: {
        spielkreis: 2,
        personId: 284461,
      },
      debug: {
        dateOffset: { second: 30 },
      },
    });
    expect(result3.origin).to.be.equal("fetch");
    expect(result3.value).to.be.deep.equal(result1.value);
  });

  it("person/artikel", async () => {
    await callFunction("deleteAllCaches");
    await wait(5_000);

    const result1 = await callFunction("getAnpfiffInfoData", {
      website: "person/artikel",
      parameters: {
        spielkreis: 2,
        personId: 205271,
        rowVon: 1,
        rowBis: 5,
      },
      debug: {
        dateOffset: { second: 30 },
      },
    });
    expect(result1.origin).to.be.equal("fetch");
    expect(result1.hasMoreData).to.be.true;
    expect(result1.value).to.satisfy(Array.isArray);
    expect(result1.value.length).to.be.equal(5);

    console.log(JSON.stringify(result1.value));

    const result2 = await callFunction("getAnpfiffInfoData", {
      website: "person/artikel",
      parameters: {
        spielkreis: 2,
        personId: 205271,
        rowVon: 1,
        rowBis: 5,
      },
      debug: {
        dateOffset: { second: 30 },
      },
    });
    expect(result2.origin).to.be.equal("cache");
    expect(result2.hasMoreData).to.be.true;
    expect(result2.value).to.satisfy(Array.isArray);
    expect(result2.value.length).to.be.equal(5);
    expect(result2.value).to.be.deep.equal(result1.value);

    await wait(31_000);

    const result3 = await callFunction("getAnpfiffInfoData", {
      website: "person/artikel",
      parameters: {
        spielkreis: 2,
        personId: 205271,
        rowVon: 1,
        rowBis: 5,
      },
      debug: {
        dateOffset: { second: 30 },
      },
    });
    expect(result3.origin).to.be.equal("fetch");
    expect(result3.hasMoreData).to.be.true;
    expect(result3.value).to.satisfy(Array.isArray);
    expect(result3.value.length).to.be.equal(5);
    expect(result3.value).to.be.deep.equal(result1.value);
  });
});
