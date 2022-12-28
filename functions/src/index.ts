import * as admin from 'firebase-admin';
import { createFunction } from './utils/createFunction';

import { GetEventsFunction } from './regularFunctions/GetEventsFunction';
import { GetNewsFunction } from './regularFunctions/GetNewsFunction';
import { GetSingleNewsFunction } from './regularFunctions/GetSingleNewsFunction';

admin.initializeApp();

export const getEvents = createFunction((data, auth) => new GetEventsFunction(data, auth));

export const getNews = createFunction((data, auth) => new GetNewsFunction(data, auth));

export const getSingleNews = createFunction((data, auth) => new GetSingleNewsFunction(data, auth));
