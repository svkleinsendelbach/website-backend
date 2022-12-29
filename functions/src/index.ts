import * as admin from 'firebase-admin';
import { createFunction } from './utils/createFunction';

import { GetEventsFunction } from './regularFunctions/GetEventsFunction';
import { GetNewsFunction } from './regularFunctions/GetNewsFunction';
import { GetSingleNewsFunction } from './regularFunctions/GetSingleNewsFunction';
import { VerifyRecaptchaFunction } from './regularFunctions/VerifyRecaptchaFunction';
import { SendContactMailFunction } from './regularFunctions/SendContactMailFunction';
import { FiatShamirChallengeGeneratorFunction } from './regularFunctions/FiatShamirChallengeGeneratorFunction';
import { DeleteAllDataFunction } from './testingFunctions/DeleteAllDataFunction';

admin.initializeApp();

export const v2_getEvents = createFunction((data, auth) => new GetEventsFunction(data, auth));

export const v2_getNews = createFunction((data, auth) => new GetNewsFunction(data, auth));

export const v2_getSingleNews = createFunction((data, auth) => new GetSingleNewsFunction(data, auth));

export const v2_verifyRecaptcha = createFunction((data, auth) => new VerifyRecaptchaFunction(data, auth));

export const v2_sendContactMail = createFunction((data, auth) => new SendContactMailFunction(data, auth));

export const v2_fiatShamirChallengeGenerator = createFunction((data, auth) => new FiatShamirChallengeGeneratorFunction(data, auth));

export const v2_deleteAllData = createFunction((data, auth) => new DeleteAllDataFunction(data, auth));
