import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { getAnpfiffInfoData as getData } from "./AnpfiffInfoData/getAnpfiffInfoData";

admin.initializeApp();

export const getAnpfiffInfoData = functions
  .region("europe-west1")
  .https.onCall(async (data, _context) => await getData(data));

export const deleteAllCaches = functions
  .region("europe-west1")
  .https.onCall(async (_data, _context) => {
    const cachesRef = admin.database().ref("caches");
    cachesRef.remove();
  });
