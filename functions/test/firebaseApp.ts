import { sha512 } from 'firebase-function';
import { FirebaseApp } from 'firebase-function/lib/src/testUtils';
import { type DatabaseScheme } from '../src/DatabaseScheme';
import { type firebaseFunctions } from '../src/firebaseFunctions';
import { User } from '../src/types/User';
import { callSecretKey, cryptionKeys, firebaseConfig, testUser } from './privateKeys';

export const firebaseApp = new FirebaseApp<typeof firebaseFunctions, DatabaseScheme>(firebaseConfig, cryptionKeys, callSecretKey, {
    functionsRegion: 'europe-west1',
    databaseUrl: firebaseConfig.databaseURL
});

export async function authenticateTestUser(roles: User.Role[] = User.Role.all) {
    if (firebaseApp.auth.currentUser === null)
        await firebaseApp.auth.signIn(testUser.email, testUser.password);
    await firebaseApp.database.child('users').child(sha512(firebaseApp.auth.currentUser!.uid)).set({
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        roles: roles
    }, 'encrypt');
}

export async function cleanUpFirebase() {
    const result = await firebaseApp.functions.function('deleteAllData').call({});
    result.success;
    await firebaseApp.auth.signOut();
}
