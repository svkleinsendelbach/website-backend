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
import { GetGameInfoFunction } from './regularFunctions/GetGameInfoFunction';

admin.initializeApp();

export const getEvents = createFunction((data, auth) => new GetEventsFunction(data, auth));

export const getNews = createFunction((data, auth) => new GetNewsFunction(data, auth));

export const getSingleNews = createFunction((data, auth) => new GetSingleNewsFunction(data, auth));

export const verifyRecaptcha = createFunction((data, auth) => new VerifyRecaptchaFunction(data, auth));

export const sendContactMail = createFunction((data, auth) => new SendContactMailFunction(data, auth));

export const fiatShamirChallengeGenerator = createFunction((data, auth) => new FiatShamirChallengeGeneratorFunction(data, auth));

export const editEvent = createFunction((data, auth) => new EditEventFunction(data, auth));

export const editNews = createFunction((data, auth) => new EditNewsFunction(data, auth));

export const addUserForWaiting = createFunction((data, auth) => new AddUserForWaitingFunction(data, auth));

export const acceptDeclineWaitingUser = createFunction((data, auth) => new AcceptDeclineWaitingUserFunction(data, auth));

export const checkUserAuthentication = createFunction((data, auth) => new CheckUserAuthenticationFunction(data, auth));

export const getUnauthenticatedUsers = createFunction((data, auth) => new GetUnauthenticatedUsersFunction(data, auth));

export const getTeamSquad = createFunction((data, auth) => new GetTeamSquadFunction(data, auth));

export const disableNews = createFunction((data, auth) => new DisableNewsFunction(data, auth));

export const getGameInfo = createFunction((data, auth) => new GetGameInfoFunction(data, auth));

export const dailyCleanup = createSchedule('0 0 * * *', context => new DailyCleanupFunction(context));

export const deleteAllData = createFunction((data, auth) => new DeleteAllDataFunction(data, auth));
