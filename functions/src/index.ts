import * as admin from 'firebase-admin';
import { createFunction } from './utils/createFunction';

import { GetEventsFunction } from './regularFunctions/GetEventsFunction';
import { GetNewsFunction } from './regularFunctions/GetNewsFunction';
import { GetSingleNewsFunction } from './regularFunctions/GetSingleNewsFunction';
import { VerifyRecaptchaFunction } from './regularFunctions/VerifyRecaptchaFunction';
import { SendContactMailFunction } from './regularFunctions/SendContactMailFunction';
import { FiatShamirChallengeGeneratorFunction } from './regularFunctions/FiatShamirChallengeGeneratorFunction';

admin.initializeApp();

export const getEvents = createFunction((data, auth) => new GetEventsFunction(data, auth));

export const getNews = createFunction((data, auth) => new GetNewsFunction(data, auth));

export const getSingleNews = createFunction((data, auth) => new GetSingleNewsFunction(data, auth));

export const verifyRecaptcha = createFunction((data, auth) => new VerifyRecaptchaFunction(data, auth));

export const sendContactMail = createFunction((data, auth) => new SendContactMailFunction(data, auth));

export const fiatShamirChallengeGenerator = createFunction((data, auth) => new FiatShamirChallengeGeneratorFunction(data, auth));
