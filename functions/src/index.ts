import * as admin from 'firebase-admin';
import { createFunction } from './utils/createFunction';

import { GetEventsFunction } from './regularFunctions/GetEventsFunction';

admin.initializeApp();

export const getEvents = createFunction((data, auth) => new GetEventsFunction(data, auth));
