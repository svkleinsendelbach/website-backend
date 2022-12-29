import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, User, UserCredential } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getDatabase, ref, onValue } from 'firebase/database';
import { Crypter } from '../src/crypter/Crypter';
import { GetEventsFunction } from '../src/regularFunctions/GetEventsFunction';
import { GetNewsFunction } from '../src/regularFunctions/GetNewsFunction';
import { GetSingleNewsFunction } from '../src/regularFunctions/GetSingleNewsFunction';
import { SendContactMailFunction } from '../src/regularFunctions/SendContactMailFunction';
import { VerifyRecaptchaFunction } from '../src/regularFunctions/VerifyRecaptchaFunction';
import { DatabaseType } from '../src/utils/DatabaseType';
import { FirebaseFunction } from '../src/utils/FirebaseFunction';
import { Exclude } from '../src/utils/utils';
import { cryptionKeys, fiatShamirKeys, firebaseConfig, testUser } from './privateKeys';
import { randomBytes } from 'crypto';
import { FiatShamirParameters, modularPower } from '../src/utils/fiatShamir';
import { guid } from '../src/classes/guid';
import { DeleteAllDataFunction } from '../src/testingFunctions/DeleteAllDataFunction';

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app, 'europe-west1');
const database = getDatabase(app, firebaseConfig.databaseURL);
export const auth = getAuth(app);

export async function signInTestUser(): Promise<UserCredential> {
    return await signInWithEmailAndPassword(auth, testUser.email, testUser.password);
}

export async function signOutUser() {
    await signOut(auth);
}

export function getCurrentUser(): User | null {
    return auth.currentUser;
}

export async function callFunction(functionName: 'v2_getEvents', parameters: Exclude<GetEventsFunction.Parameters, FirebaseFunction.DefaultParameters>): Promise<GetEventsFunction.ReturnType>
export async function callFunction(functionName: 'v2_getNews', parameters: Exclude<GetNewsFunction.Parameters, FirebaseFunction.DefaultParameters>): Promise<GetNewsFunction.ReturnType>
export async function callFunction(functionName: 'v2_getSingleNews', parameters: Exclude<GetSingleNewsFunction.Parameters, FirebaseFunction.DefaultParameters>): Promise<GetSingleNewsFunction.ReturnType>
export async function callFunction(functionName: 'v2_verifyRecaptcha', parameters: Exclude<VerifyRecaptchaFunction.Parameters, FirebaseFunction.DefaultParameters>): Promise<VerifyRecaptchaFunction.ReturnType>
export async function callFunction(functionName: 'v2_sendContactMail', parameters: Exclude<SendContactMailFunction.Parameters, FirebaseFunction.DefaultParameters>): Promise<SendContactMailFunction.ReturnType>
export async function callFunction(functionName: 'v2_deleteAllData', parameters: Exclude<DeleteAllDataFunction.Parameters, FirebaseFunction.DefaultParameters>): Promise<DeleteAllDataFunction.ReturnType>
export async function callFunction<Params, Result>(functionName: string, parameters: Params): Promise<Result> {
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
            databaseType: databaseType
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
        verbose: true,
        databaseType: databaseType.value,
        parameters: crypter.encodeEncrypt({
            databaseType: databaseType,
            identifier: identifier,
            bs: asAndBs.bs
        })
    });
    const challenges: (0 | 1)[] = crypter.decryptDecode(httpsCallableResult.data);
    return {
        as: asAndBs.as,
        challenges: challenges
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

export async function wait(milliseconds: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}
