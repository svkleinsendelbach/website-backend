import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

import * as getData from './AnpfiffInfoData/getAnpfiffInfoData';
import { GetAllDBPlayersFunction } from './GetAllDBPlayersFunction';

admin.initializeApp();

export const getAnpfiffInfoData = functions
  .region('europe-west1')
  .https.onCall(async (data, _context) => await getData.getAnpfiffInfoData(data));

export const deleteAllCaches = functions.region('europe-west1').https.onCall(async (_data, _context) => {
  const cachesRef = admin.database().ref('caches');
  cachesRef.remove();
});

export const getAllDBPlayers = functions.region('europe-west1').https.onCall(async (data, _context) => {
  const firebaseFunction = new GetAllDBPlayersFunction(data);
  return await firebaseFunction.executeFunction();
});
