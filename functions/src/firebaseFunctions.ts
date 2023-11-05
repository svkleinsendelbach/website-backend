import { FirebaseDescriptor, type FirebaseFunctions } from 'firebase-function';

import { DeleteAllDataFunction, type DeleteAllDataFunctionType } from './functions/DeleteAllDataFunction';
import { IcsEventsRequest, type IcsEventsRequestType } from './functions/IcsEventsRequest';
import { VerifyRecaptchaFunction, type VerifyRecaptchaFunctionType } from './functions/VerifyRecaptchaFunction';

import { EventGetFunction, type EventGetFunctionType } from './functions/EventGetFunction';
import { EventEditFunction, type EventEditFunctionType } from './functions/EventEditFunction';

import { ReportGetFunction, type ReportGetFunctionType } from './functions/ReportGetFunction';
import { ReportGetAllFunction, type ReportGetAllFunctionType } from './functions/ReportGetAllFunction';
import { ReportEditFunction, type ReportEditFunctionType } from './functions/ReportEditFunction';

import { OccupancyDiscordSchedule } from './functions/OccupancyDiscordSchedule';
import { OccupancyGetAllFunction, type OccupancyGetAllFunctionType } from './functions/OccupancyGetAllFunction';
import { OccupancyEditFunction, type OccupancyEditFunctionType } from './functions/OccupancyEditFunction';

import { CriticismSuggestionGetAllFunction, type CriticismSuggestionGetAllFunctionType } from './functions/CriticismSuggestionGetAllFunction';
import { CriticismSuggestionEditFunction, type CriticismSuggestionEditFunctionType } from './functions/CriticismSuggestionEditFunction';

import { GameInfoGetFunction, type GameInfoGetFunctionType } from './functions/GameInfoGetFunction';
import { TeamSquadGetFunction, type TeamSquadGetFunctionType } from './functions/TeamSquadGetFunction';

import { ContactFunction, type ContactFunctionType } from './functions/ContactFunction';

import { UserRequestAccessFunction, type UserRequestAccessFunctionType } from './functions/UserRequestAccessFunction';
import { UserGetAllFunction, type UserGetAllFunctionType } from './functions/UserGetAllFunction';
import { UserCheckRolesFunction, type UserCheckRolesFunctionType } from './functions/UserCheckRolesFunction';
import { UserHandleAccessRequestFunction, type UserHandleAccessRequestFunctionType } from './functions/UserHandleAccessRequestFunction';
import { UserEditRolesFunction, type UserEditRolesFunctionType } from './functions/UserEditRolesFunction';
import { NewsletterEditFunction, type NewsletterEditFunctionType } from './functions/NewsletterEditFunction';
import { NewsletterGetAllFunction, type NewsletterGetAllFunctionType } from './functions/NewsletterGetAllFunction';
import { NewsletterGetFunction, type NewsletterGetFunctionType } from './functions/NewsletterGetFunction';
import { NewsletterSubscriptionGetAllFunction, type NewsletterSubscriptionGetAllFunctionType } from './functions/NewsletterSubscriptionGetAllFunction';
import { NewsletterSubscriptionSubscribeFunction, type NewsletterSubscriptionSubscribeFunctionType } from './functions/NewsletterSubscriptionSubscribeFunction';
import { NewsletterSubscriptionUnsubscribeFunction, type NewsletterSubscriptionUnsubscribeFunctionType } from './functions/NewsletterSubscriptionUnsubscribeFunction';

export const firebaseFunctions = {
    verifyRecaptcha: FirebaseDescriptor._function<VerifyRecaptchaFunctionType>(VerifyRecaptchaFunction),
    icsEvents: FirebaseDescriptor.request<IcsEventsRequestType>(IcsEventsRequest),
    deleteAllData: FirebaseDescriptor._function<DeleteAllDataFunctionType>(DeleteAllDataFunction),
    contact: FirebaseDescriptor._function<ContactFunctionType>(ContactFunction),
    event: {
        get: FirebaseDescriptor._function<EventGetFunctionType>(EventGetFunction),
        edit: FirebaseDescriptor._function<EventEditFunctionType>(EventEditFunction)
    },
    report: {
        get: FirebaseDescriptor._function<ReportGetFunctionType>(ReportGetFunction),
        getAll: FirebaseDescriptor._function<ReportGetAllFunctionType>(ReportGetAllFunction),
        edit: FirebaseDescriptor._function<ReportEditFunctionType>(ReportEditFunction)
    },
    occupancy: {
        getAll: FirebaseDescriptor._function<OccupancyGetAllFunctionType>(OccupancyGetAllFunction),
        edit: FirebaseDescriptor._function<OccupancyEditFunctionType>(OccupancyEditFunction),
        discordSchedule: FirebaseDescriptor.schedule('0 9 * * MON', OccupancyDiscordSchedule)
    },
    criticismSuggestion: {
        getAll: FirebaseDescriptor._function<CriticismSuggestionGetAllFunctionType>(CriticismSuggestionGetAllFunction),
        edit: FirebaseDescriptor._function<CriticismSuggestionEditFunctionType>(CriticismSuggestionEditFunction)
    },
    newsletter: {
        get: FirebaseDescriptor._function<NewsletterGetFunctionType>(NewsletterGetFunction),
        getAll: FirebaseDescriptor._function<NewsletterGetAllFunctionType>(NewsletterGetAllFunction),
        edit: FirebaseDescriptor._function<NewsletterEditFunctionType>(NewsletterEditFunction),
        subscription: {
            getAll: FirebaseDescriptor._function<NewsletterSubscriptionGetAllFunctionType>(NewsletterSubscriptionGetAllFunction),
            subscribe: FirebaseDescriptor._function<NewsletterSubscriptionSubscribeFunctionType>(NewsletterSubscriptionSubscribeFunction),
            unsubscribe: FirebaseDescriptor._function<NewsletterSubscriptionUnsubscribeFunctionType>(NewsletterSubscriptionUnsubscribeFunction)
        }  
    },
    bfvData: {
        gameInfo: FirebaseDescriptor._function<GameInfoGetFunctionType>(GameInfoGetFunction),
        teamSquad: FirebaseDescriptor._function<TeamSquadGetFunctionType>(TeamSquadGetFunction)
    },
    user: {
        requestAccess: FirebaseDescriptor._function<UserRequestAccessFunctionType>(UserRequestAccessFunction),
        getAll: FirebaseDescriptor._function<UserGetAllFunctionType>(UserGetAllFunction),
        checkRoles: FirebaseDescriptor._function<UserCheckRolesFunctionType>(UserCheckRolesFunction),
        handleAccessRequest: FirebaseDescriptor._function<UserHandleAccessRequestFunctionType>(UserHandleAccessRequestFunction),
        editRoles: FirebaseDescriptor._function<UserEditRolesFunctionType>(UserEditRolesFunction)
    }
} satisfies FirebaseFunctions;
