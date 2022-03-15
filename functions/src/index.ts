import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

import * as getData from './AnpfiffInfoData/getAnpfiffInfoData';
import { GetAllDBPlayersFunction } from './GetAllDBPlayersFunction';
import { GetEventsFunction } from './GetEventsFunction';
import { GetHomeTopFunction } from './GetHomeTopFunction';
import { Logger } from './Logger/Logger';
import { ParameterContainer } from './ParameterContainer';
import { SendContactMailFunction } from './SendContactMailFunction';
import { reference } from './utils';
import { VerifyRecaptchaFunction } from './VerityRecaptchaFunction';
import { AcceptDeclineUserWaitingForRegistrationForEditingFunction } from './websiteEditingFunctions/AcceptDeclineUserWaitingForRegistrationForEditingFunction';
import { AddUserToWaitingForRegistrationForEditingFunction } from './websiteEditingFunctions/AddUserToWaitingForRegistrationForEditingFunction';
import { CheckUserForEditingFunction } from './websiteEditingFunctions/CheckUserForEditingFunction';
import { GetUsersToWaitingForRegistrationForEditingFunction } from './websiteEditingFunctions/GetUsersWaitingForRegistrationForEditingFunction';

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

export const verifyRecaptcha = functions.region('europe-west1').https.onCall(async (data, _context) => {
  const firebaseFunction = VerifyRecaptchaFunction.fromData(data);
  return await firebaseFunction.executeFunction();
});

export const sendContactMail = functions.region('europe-west1').https.onCall(async (data, _context) => {
  const firebaseFunction = SendContactMailFunction.fromData(data);
  return await firebaseFunction.executeFunction();
});

export const checkUserForEditing = functions.region('europe-west1').https.onCall(async (data, _context) => {
  const firebaseFunction = CheckUserForEditingFunction.fromData(data);
  return await firebaseFunction.executeFunction();
});

export const addUserToWaitingForRegistrationForEditing = functions
  .region('europe-west1')
  .https.onCall(async (data, _context) => {
    const firebaseFunction = AddUserToWaitingForRegistrationForEditingFunction.fromData(data);
    return await firebaseFunction.executeFunction();
  });

export const getUsersToWaitingForRegistrationForEditing = functions
  .region('europe-west1')
  .https.onCall(async (data, _context) => {
    const firebaseFunction = GetUsersToWaitingForRegistrationForEditingFunction.fromData(data);
    return await firebaseFunction.executeFunction();
  });

export const acceptDeclineUserWaitingForRegistrationForEditing = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    const firebaseFunction = AcceptDeclineUserWaitingForRegistrationForEditingFunction.fromData(data, context);
    return await firebaseFunction.executeFunction();
  });

export const addTestUserToTesting = functions.region('europe-west1').https.onCall(async (_data, _context) => {
  const parameterContainer = new ParameterContainer({ dbType: 'testing' });
  const logger = Logger.start(parameterContainer, 'addTestUserToTesting');
  const userId =
    '3fee1b7d0aa72807c0c9a88e2bb2fb8f10d5aeaecec8ad74ba5c363664d74c97ef5df37b08a52b3f3adc42af114884378c1083c43a612dfd53d0c5cf4286ad05';
  const userRef = reference(`users/websiteEditors/${userId}`, parameterContainer, logger);
  userRef.set({ first: 'Test', last: 'User' });
});

export const deleteAllUsersInTestingDB = functions.region('europe-west1').https.onCall(async (_data, _context) => {
  const parameterContainer = new ParameterContainer({ dbType: 'testing' });
  const logger = Logger.start(parameterContainer, 'deleteAllUsersInTestingDB');
  const usersRef = reference('users', parameterContainer, logger);
  usersRef.remove();
});
