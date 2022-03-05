import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

import * as getData from './AnpfiffInfoData/getAnpfiffInfoData';
import { GetAllDBPlayersFunction } from './GetAllDBPlayersFunction';
import { GetEventsFunction } from './GetEventsFunction';
import { GetHomeTopFunction } from './GetHomeTopFunction';

admin.initializeApp();

export const getAnpfiffInfoData = functions
  .region('europe-west1')
  .https.onCall(async (data, _context) => await getData.getAnpfiffInfoData(data));

export const deleteAllCaches = functions.region('europe-west1').https.onCall(async (_data, _context) => {
  const cachesRef = admin.database().ref('caches');
  cachesRef.remove();
});

export const getAllDBPlayers = functions.region('europe-west1').https.onCall(async (data, _context) => {
  const firebaseFunction = GetAllDBPlayersFunction.fromData(data);
  return await firebaseFunction.executeFunction();
});

export const getHomeTop = functions.region('europe-west1').https.onCall(async (data, _context) => {
  const firebaseFunction = GetHomeTopFunction.fromData(data);
  return await firebaseFunction.executeFunction();
});

export const getEvents = functions.region('europe-west1').https.onCall(async (data, _context) => {
  const firebaseFunction = GetEventsFunction.fromData(data);
  return await firebaseFunction.executeFunction();
});
