
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, User, UserCredential } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { DatabaseType } from '../src/utils/DatabaseType';
import { firebaseConfig, testUser } from './firebaseConfig';

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app, 'europe-west1');
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

export async function callFunction<Params, Result>(functionName: string, parameters: Params): Promise<Result> {
    const callableFunction = httpsCallable<Params & {
        // privateKey: string
        databaseType: 'release' | 'debug' | 'testing'
    }, Result>(functions, functionName);
    const databaseType = new DatabaseType('testing');
    const httpsCallableResult = await callableFunction({
        ...parameters,
        // privateKey: functionCallKey(databaseType),
        databaseType: databaseType.value
    });
    return httpsCallableResult.data;
}

export async function wait(milliseconds: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}
