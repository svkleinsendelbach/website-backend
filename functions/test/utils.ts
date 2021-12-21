import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, UserCredential } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';

import { firebaseConfig, testUser } from './firebaseConfig';

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
