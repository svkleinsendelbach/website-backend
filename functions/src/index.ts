import * as admin from 'firebase-admin';
import { createFunction, createSchedule } from './utils/createFunction';

import { GetEventsFunction } from './regularFunctions/GetEventsFunction';
import { GetNewsFunction } from './regularFunctions/GetNewsFunction';
import { GetSingleNewsFunction } from './regularFunctions/GetSingleNewsFunction';
import { VerifyRecaptchaFunction } from './regularFunctions/VerifyRecaptchaFunction';
import { SendContactMailFunction } from './regularFunctions/SendContactMailFunction';
import { FiatShamirChallengeGeneratorFunction } from './regularFunctions/FiatShamirChallengeGeneratorFunction';
import { DeleteAllDataFunction } from './testingFunctions/DeleteAllDataFunction';
import { EditNewsFunction } from './regularFunctions/EditNewsFunction';
import { AddUserForWaitingFunction } from './regularFunctions/AddUserForWaitingFunction';
import { AcceptDeclineWaitingUserFunction } from './regularFunctions/AcceptDeclineWaitingUserFunction';
import { CheckUserAuthenticationFunction } from './regularFunctions/CheckUserAuthenticationFunction';
import { GetUnauthenticatedUsersFunction } from './regularFunctions/GetUnauthenticatedUsersFunction';
import { EditEventFunction } from './regularFunctions/EditEventFunction';
import { GetTeamSquadFunction } from './regularFunctions/GetTeamSquadFunction';
import { DailyCleanupFunction } from './regularFunctions/DailyCleanupFunction';
import { DisableNewsFunction } from './regularFunctions/DisableNewsFunction';
import { BfvLivetickerFunction } from './regularFunctions/BfvLivetickerFunction';

admin.initializeApp();

export const v2_getEvents = createFunction((data, auth) => new GetEventsFunction(data, auth));

export const v2_getNews = createFunction((data, auth) => new GetNewsFunction(data, auth));

export const v2_getSingleNews = createFunction((data, auth) => new GetSingleNewsFunction(data, auth));

export const v2_verifyRecaptcha = createFunction((data, auth) => new VerifyRecaptchaFunction(data, auth));

export const v2_sendContactMail = createFunction((data, auth) => new SendContactMailFunction(data, auth));

export const v2_fiatShamirChallengeGenerator = createFunction((data, auth) => new FiatShamirChallengeGeneratorFunction(data, auth));

export const v2_editEvent = createFunction((data, auth) => new EditEventFunction(data, auth));

export const v2_editNews = createFunction((data, auth) => new EditNewsFunction(data, auth));

export const v2_addUserForWaiting = createFunction((data, auth) => new AddUserForWaitingFunction(data, auth));

export const v2_acceptDeclineWaitingUser = createFunction((data, auth) => new AcceptDeclineWaitingUserFunction(data, auth));

export const v2_checkUserAuthentication = createFunction((data, auth) => new CheckUserAuthenticationFunction(data, auth));

export const v2_getUnauthenticatedUsers = createFunction((data, auth) => new GetUnauthenticatedUsersFunction(data, auth));

export const v2_getTeamSquad = createFunction((data, auth) => new GetTeamSquadFunction(data, auth));

export const v2_disableNews = createFunction((data, auth) => new DisableNewsFunction(data, auth));

export const v2_bfvLiveticker = createFunction((data, auth) => new BfvLivetickerFunction(data, auth));

export const v2_dailyCleanup = createSchedule('0 0 * * *', context => new DailyCleanupFunction(context));

export const v2_deleteAllData = createFunction((data, auth) => new DeleteAllDataFunction(data, auth));
