import { FirebaseFunctionDescriptor, type FirebaseFunctionsType } from 'firebase-function';
import { DeleteAllDataFunction, type DeleteAllDataFunctionType } from './functions/DeleteAllDataFunction';
import { UserAuthenticationAddFunction, type UserAuthenticationAddFunctionType } from './functions/UserAuthenticationAddFunction';
import { UserAuthenticationCheckFunction, type UserAuthenticationCheckFunctionType } from './functions/UserAuthenticationCheckFunction';
import { UserAuthenticationAcceptDeclineFunction, type UserAuthenticationAcceptDeclineFunctionType } from './functions/UserAuthenticationAcceptDeclineFunction';
import { UserAuthenticationGetAllUnauthenticatedFunction, type UserAuthenticationGetAllUnauthenticatedFunctionType } from './functions/UserAuthenticationGetAllUnauthenticatedFunction';
import { EventEditFunction, type EventEditFunctionType } from './functions/EventEditFunction';
import { EventGetFunction, type EventGetFunctionType } from './functions/EventGetFunction';
import { NewsEditFunction, type NewsEditFunctionType } from './functions/NewsEditFunction';
import { NewsGetSingleFunction, type NewsGetSingleFunctionType } from './functions/NewsGetSingle';
import { NewsGetFunction, type NewsGetFunctionType } from './functions/NewsGetFunction';
import { NewsDisableFunction, type NewsDisableFunctionType } from './functions/NewsDisableFunction';
import { VerifyRecaptchaFunction, type VerifyRecaptchaFunctionType } from './functions/VerifyRecaptchaFunction';
import { SendMailContactFunction, type SendMailContactFunctionType } from './functions/SendMailContactFunction';
import { TeamSquadGetFunction, type TeamSquadGetFunctionType } from './functions/TeamSquadGetFunction';
import { GameInfoGetFunction, type GameInfoGetFunctionType } from './functions/GameInfoGetFunction';
import { ReportEditFunction, type ReportEditFunctionType } from './functions/ReportEditFunction';
import { ReportGetFunction, type ReportGetFunctionType } from './functions/ReportGetFunction';
import { SearchEntityFunction, type SearchEntityFunctionType } from './functions/SearchEntityFunction';
import { NotificationRegisterFunction, type NotificationRegisterFunctionType } from './functions/NotificationRegisterFunction';
import { NotificationPushFunction, type NotificationPushFunctionType } from './functions/NotificationPushFunction';

export const firebaseFunctions = {
    verifyRecaptcha: FirebaseFunctionDescriptor.create<VerifyRecaptchaFunctionType>(VerifyRecaptchaFunction),
    deleteAllData: FirebaseFunctionDescriptor.create<DeleteAllDataFunctionType>(DeleteAllDataFunction),
    searchEntity: FirebaseFunctionDescriptor.create<SearchEntityFunctionType>(SearchEntityFunction),
    news: {
        get: FirebaseFunctionDescriptor.create<NewsGetFunctionType>(NewsGetFunction),
        edit: FirebaseFunctionDescriptor.create<NewsEditFunctionType>(NewsEditFunction),
        disable: FirebaseFunctionDescriptor.create<NewsDisableFunctionType>(NewsDisableFunction),
        getSingle: FirebaseFunctionDescriptor.create<NewsGetSingleFunctionType>(NewsGetSingleFunction)
    },
    event: {
        get: FirebaseFunctionDescriptor.create<EventGetFunctionType>(EventGetFunction),
        edit: FirebaseFunctionDescriptor.create<EventEditFunctionType>(EventEditFunction)
    },
    report: {
        get: FirebaseFunctionDescriptor.create<ReportGetFunctionType>(ReportGetFunction),
        edit: FirebaseFunctionDescriptor.create<ReportEditFunctionType>(ReportEditFunction)
    },
    bfvData: {
        gameInfo: FirebaseFunctionDescriptor.create<GameInfoGetFunctionType>(GameInfoGetFunction),
        teamSquad: FirebaseFunctionDescriptor.create<TeamSquadGetFunctionType>(TeamSquadGetFunction)
    },
    sendMail: {
        contact: FirebaseFunctionDescriptor.create<SendMailContactFunctionType>(SendMailContactFunction)
    },
    userAuthentication: {
        add: FirebaseFunctionDescriptor.create<UserAuthenticationAddFunctionType>(UserAuthenticationAddFunction),
        check: FirebaseFunctionDescriptor.create<UserAuthenticationCheckFunctionType>(UserAuthenticationCheckFunction),
        acceptDecline: FirebaseFunctionDescriptor.create<UserAuthenticationAcceptDeclineFunctionType>(UserAuthenticationAcceptDeclineFunction),
        getAllUnauthenticated: FirebaseFunctionDescriptor.create<UserAuthenticationGetAllUnauthenticatedFunctionType>(UserAuthenticationGetAllUnauthenticatedFunction)
    },
    notification: {
        register: FirebaseFunctionDescriptor.create<NotificationRegisterFunctionType>(NotificationRegisterFunction),
        push: FirebaseFunctionDescriptor.create<NotificationPushFunctionType>(NotificationPushFunction)
    }
} satisfies FirebaseFunctionsType;
