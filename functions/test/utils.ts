import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, User, UserCredential } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';

import { firebaseConfig, testUser } from './firebaseConfig';

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app, 'europe-west1');
export const auth = getAuth();

export async function signInTestUser(): Promise<UserCredential> {
  return await signInWithEmailAndPassword(auth, testUser.email, testUser.password);
}

export async function signOutUser() {
  await signOut(auth);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

export async function callFunction<Result = any>(fn: string): Promise<Result>;
export async function callFunction<Params = any, Result = any>(fn: string, p: Params): Promise<Result>;
export async function callFunction<Params, Result>(
  functionName: string,
  parameters: Params | undefined = undefined,
): Promise<Result> {
  return (
    await httpsCallable<Params | { dbType: 'testing' }, Result>(
      functions,
      functionName,
    )({ ...parameters, dbType: 'testing' })
  ).data;
}

export async function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve, _reject) => {
    setTimeout(() => {
      resolve();
    }, milliseconds);
  });
}
