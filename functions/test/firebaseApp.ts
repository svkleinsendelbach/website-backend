import { Crypter } from 'firebase-function';
import { FirebaseApp } from 'firebase-function/lib/src/testUtils';
import { type DatabaseScheme } from '../src/DatabaseScheme';
import { type firebaseFunctions } from '../src/firebaseFunctions';
import { type UserAuthenticationType } from '../src/types/UserAuthentication';
import { callSecretKey, cryptionKeys, firebaseConfig, testUser } from './privateKeys';

export const firebaseApp = new FirebaseApp<typeof firebaseFunctions, DatabaseScheme>(firebaseConfig, cryptionKeys, callSecretKey, {
    functionsRegion: 'europe-west1',
    databaseUrl: firebaseConfig.databaseURL
});

export async function authenticateTestUser() {
    await firebaseApp.auth.signIn(testUser.email, testUser.password);
    const authenticationTypes: UserAuthenticationType[] = ['editEvents', 'editNews', 'editReports', 'authenticateUser', 'notification'];
    await Promise.all(authenticationTypes.map(async authenticationType => await authenticateUser(authenticationType)));
}

async function authenticateUser(authenticationType: UserAuthenticationType) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await firebaseApp.database.child('users').child('authentication').child(authenticationType).child(Crypter.sha512(firebaseApp.auth.currentUser!.uid)).set({
        state: 'authenticated',
        firstName: testUser.firstName,
        lastName: testUser.lastName
    }, 'encrypt');
}

export async function cleanUpFirebase() {
    const result = await firebaseApp.functions.function('deleteAllData').call({});
    result.success;
    await firebaseApp.auth.signOut();
}
