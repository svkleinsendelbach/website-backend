import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, User, UserCredential } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import { Crypter } from '../src/crypter/Crypter';
import { GetEventsFunction } from '../src/regularFunctions/GetEventsFunction';
import { GetSingleNewsFunction } from '../src/regularFunctions/GetSingleNewsFunction';
import { SendContactMailFunction } from '../src/regularFunctions/SendContactMailFunction';
import { VerifyRecaptchaFunction } from '../src/regularFunctions/VerifyRecaptchaFunction';
import { DatabaseType } from '../src/classes/DatabaseType';
import { FirebaseFunction } from '../src/utils/FirebaseFunction';
import { cryptionKeys, fiatShamirKeys, firebaseConfig, testUser } from './privateKeys';
import { randomBytes } from 'crypto';
import { guid } from '../src/classes/guid';
import { DeleteAllDataFunction } from '../src/testingFunctions/DeleteAllDataFunction';
import { assert, expect } from 'chai';
import { FunctionsErrorCode } from 'firebase-functions/lib/common/providers/https';
import { AcceptDeclineWaitingUserFunction } from '../src/regularFunctions/AcceptDeclineWaitingUserFunction';
import { AddUserForWaitingFunction } from '../src/regularFunctions/AddUserForWaitingFunction';
import { CheckUserAuthenticationFunction } from '../src/regularFunctions/CheckUserAuthenticationFunction';
import { EditNewsFunction } from '../src/regularFunctions/EditNewsFunction';
import { GetUnauthenticatedUsersFunction } from '../src/regularFunctions/GetUnauthenticatedUsersFunction';
import { EditEventFunction } from '../src/regularFunctions/EditEventFunction';
import { FiatShamirParameters } from '../src/classes/FiatShamirParameters';
import { modularPower } from '../src/utils/utils';
import { FirebaseDatabase } from '../src/utils/FirebaseDatabase';

const app = initializeApp(firebaseConfig);
export const functions = getFunctions(app, 'europe-west1');
const database = getDatabase(app, firebaseConfig.databaseURL);
export const auth = getAuth(app);

export async function signInTestUser(): Promise<UserCredential> {
    return await signInWithEmailAndPassword(auth, testUser.email, testUser.password);
}

export async function signOutUser() {
    if (getCurrentUser !== null)
        await signOut(auth);
}

export function getCurrentUser(): User | null {
    return auth.currentUser;
}

export async function callFunction(functionName: 'v2_getEvents', parameters: GetEventsFunction.CallParameters): Promise<FirebaseFunction.Result<GetEventsFunction.ReturnType>>
export async function callFunction(functionName: 'v2_getSingleNews', parameters: GetSingleNewsFunction.CallParameters): Promise<FirebaseFunction.Result<GetSingleNewsFunction.ReturnType>>
export async function callFunction(functionName: 'v2_verifyRecaptcha', parameters: VerifyRecaptchaFunction.CallParameters): Promise<FirebaseFunction.Result<VerifyRecaptchaFunction.ReturnType>>
export async function callFunction(functionName: 'v2_sendContactMail', parameters: SendContactMailFunction.CallParameters): Promise<FirebaseFunction.Result<SendContactMailFunction.ReturnType>>
export async function callFunction(functionName: 'v2_deleteAllData', parameters: DeleteAllDataFunction.CallParameters): Promise<FirebaseFunction.Result<DeleteAllDataFunction.ReturnType>>
export async function callFunction(functionName: 'v2_addUserForWaiting', parameters: AddUserForWaitingFunction.CallParameters): Promise<FirebaseFunction.Result<AddUserForWaitingFunction.ReturnType>>
export async function callFunction(functionName: 'v2_acceptDeclineWaitingUser', parameters: AcceptDeclineWaitingUserFunction.CallParameters): Promise<FirebaseFunction.Result<AcceptDeclineWaitingUserFunction.ReturnType>>
export async function callFunction(functionName: 'v2_checkUserAuthentication', parameters: CheckUserAuthenticationFunction.CallParameters): Promise<FirebaseFunction.Result<CheckUserAuthenticationFunction.ReturnType>>
export async function callFunction(functionName: 'v2_getUnauthenticatedUsers', parameters: GetUnauthenticatedUsersFunction.CallParameters): Promise<FirebaseFunction.Result<GetUnauthenticatedUsersFunction.ReturnType>>
export async function callFunction(functionName: 'v2_editEvent', parameters: EditEventFunction.CallParameters): Promise<FirebaseFunction.Result<EditEventFunction.ReturnType>>
export async function callFunction(functionName: 'v2_editNews', parameters: EditNewsFunction.CallParameters): Promise<FirebaseFunction.Result<EditNewsFunction.ReturnType>>
export async function callFunction<Params, Result>(functionName: string, parameters: Params): Promise<FirebaseFunction.Result<Result>> {
    const databaseType = new DatabaseType('testing');
    const crypter = new Crypter(cryptionKeys);
    const fiatShamirParameters = await getFiatShamirParameters();
    const callableFunction = httpsCallable<{
        verbose: boolean,
        databaseType: 'release' | 'debug' | 'testing',
        parameters: string
    }, string>(functions, functionName);
    const httpsCallableResult = await callableFunction({
        verbose: true,
        databaseType: databaseType.value,
        parameters: crypter.encodeEncrypt({
            ...parameters,
            fiatShamirParameters: fiatShamirParameters,
            databaseType: databaseType.value
        })
    });
    return crypter.decryptDecode(httpsCallableResult.data);
}

async function getFiatShamirParameters(): Promise<FiatShamirParameters> {
    const identifier = guid.newGuid();
    const asAndChallenges = await callFiatShamirChallengeGeneratorFunction(identifier);
    const cs: bigint[] = [];
    for (let i = 0; i < 32; i++)
        cs.push(((asAndChallenges.challenges[i] === 0 ? 1n : fiatShamirKeys.e) * asAndChallenges.as[i]) % fiatShamirKeys.N);
    return {
        identifier: identifier,
        cs: cs
    };
}

async function callFiatShamirChallengeGeneratorFunction(identifier: guid): Promise<{ as: bigint[], challenges: (0 | 1)[] }> {
    const databaseType = new DatabaseType('testing');
    const crypter = new Crypter(cryptionKeys);
    const asAndBs = generateAsAndBs();
    const callableFunction = httpsCallable<{
        verbose: boolean,
        databaseType: 'release' | 'debug' | 'testing',
        parameters: string
    }, string>(functions, 'v2_fiatShamirChallengeGenerator');
    const httpsCallableResult = await callableFunction({
        verbose: false,
        databaseType: databaseType.value,
        parameters: crypter.encodeEncrypt({
            databaseType: databaseType.value,
            identifier: identifier.guidString,
            bs: asAndBs.bs
        })
    });
    const functionResult: FirebaseFunction.Result<(0 | 1)[]> = crypter.decryptDecode(httpsCallableResult.data);
    expectSuccess(functionResult);
    assert(functionResult.state === 'success');
    return {
        as: asAndBs.as,
        challenges: functionResult.returnValue
    };
}

function generateAsAndBs(): { as: bigint[], bs: bigint[] } {
    const as: bigint[] = [];
    const bs: bigint[] = [];
    for (let i = 0; i < 32; i++) {
        const a = BigInt('0x' + randomBytes(128).toString('hex')) % fiatShamirKeys.N;
        const b = modularPower(a, 2n, fiatShamirKeys.N);      
        as.push(a);
        bs.push(b);  
    }
    return {
        as: as,
        bs: bs
    };
}

export function expectHttpsError(execute: () => void, code: FunctionsErrorCode) {
    try {
        execute();
    } catch (error: any) {
        expect(error).to.have.ownProperty('httpErrorCode');
        expect(error).to.have.ownProperty('code');
        expect(error.code).to.be.equal(code);
        return;
    }
    expect.fail('Expected to throw an error.');
}

export function expectFailed<T>(result: FirebaseFunction.Result<T>): Expect<{
    code: FunctionsErrorCode,
    message: string,
}> {
    expect(result.state).to.be.equal('failure');
    assert(result.state === 'failure');
    return new Expect({
        code: result.error.code,
        message: result.error.message
    });
}

export function expectSuccess<T>(result: FirebaseFunction.Result<T>): Expect<T> {
    if (result.state === 'failure') {
        console.log(`Failed with error: ${result.error.code}, ${result.error.message}`);
        console.log(result.error.details);
        console.log(result.error.stack);
    }
    expect(result.state).to.be.equal('success');
    assert(result.state === 'success');
    return new Expect(result.returnValue);
}

class Expect<T> {
    public constructor(private readonly _value: T) { }

    public value<Key extends keyof T>(key: Key): Expect<T[Key]> {
        return new Expect<T[Key]>(this._value[key]);
    }

    public get to(): Expect1<T> {
        return new Expect1<T>(this._value);
    }
}

class Expect1<T> {
    public constructor(private readonly value: T) { }

    public get be(): Expect2<T> {
        return new Expect2<T>(this.value);
    }
}

class Expect2<T> {
    public constructor(private readonly value: T) { }

    public get deep(): Expect3<T> {
        return new Expect3<T>(this.value);
    }

    public equal(value: T, message?: string): Chai.Assertion {
        return expect(this.value).to.be.equal(value, message);
    }
}

class Expect3<T> {
    public constructor(private readonly value: T) { }

    public equal(value: T, message?: string): Chai.Assertion {
        return expect(this.value).to.be.deep.equal(value, message);
    }
}

export async function getOptionalDatabaseValue<T>(referencePath: string): Promise<T | null> {
    const reference = ref(database, referencePath);
    return new Promise<T | null>(resolve => {
        onValue(reference, snapshot => {
            if (!snapshot.exists())
                return resolve(null);
            resolve(snapshot.val());
        });
    });
}

export async function getDatabaseValue<T>(referencePath: string): Promise<T> {
    const optionalValue = await getOptionalDatabaseValue<T>(referencePath);
    if (optionalValue === null) 
        throw new Error('No data in snapshot.');
    return optionalValue;
}

export async function getDecryptedOptionalDatabaseValue<T>(referencePath: string): Promise<T | null> {
    const crypter = new Crypter(cryptionKeys);
    const encryptedValue = await getOptionalDatabaseValue<string>(referencePath);
    if (encryptedValue === null) return null;
    return crypter.decryptDecode(encryptedValue);
}

export async function getDecryptedDatabaseValue<T>(referencePath: string): Promise<T> {
    const crypter = new Crypter(cryptionKeys);
    const encryptedValue = await getDatabaseValue<string>(referencePath);
    return crypter.decryptDecode(encryptedValue);
}

export async function setDatabaseValue(referencePath: string, value: FirebaseDatabase.ValueType) {
    const reference = ref(database, referencePath || undefined);
    await set(reference, value);
}

export async function existsDatabaseValue(referencePath: string): Promise<boolean> {
    return (await getOptionalDatabaseValue(referencePath)) !== null;
}

export async function wait(milliseconds: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}
