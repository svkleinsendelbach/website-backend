
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

export const firebaseFunctions = {
    verifyRecaptcha: FirebaseFunctionDescriptor.create<typeof VerifyRecaptchaFunction, VerifyRecaptchaFunctionType>(VerifyRecaptchaFunction),
    deleteAllData: FirebaseFunctionDescriptor.create<typeof DeleteAllDataFunction, DeleteAllDataFunctionType>(DeleteAllDataFunction),
    news: {
        get: FirebaseFunctionDescriptor.create<typeof NewsGetFunction, NewsGetFunctionType>(NewsGetFunction),
        edit: FirebaseFunctionDescriptor.create<typeof NewsEditFunction, NewsEditFunctionType>(NewsEditFunction),
        disable: FirebaseFunctionDescriptor.create<typeof NewsDisableFunction, NewsDisableFunctionType>(NewsDisableFunction),
        getSingle: FirebaseFunctionDescriptor.create<typeof NewsGetSingleFunction, NewsGetSingleFunctionType>(NewsGetSingleFunction)
    },
    event: {
        get: FirebaseFunctionDescriptor.create<typeof EventGetFunction, EventGetFunctionType>(EventGetFunction),
        edit: FirebaseFunctionDescriptor.create<typeof EventEditFunction, EventEditFunctionType>(EventEditFunction)
    },
    bfvData: {
        gameInfo: FirebaseFunctionDescriptor.create<typeof GameInfoGetFunction, GameInfoGetFunctionType>(GameInfoGetFunction),
        teamSquad: FirebaseFunctionDescriptor.create<typeof TeamSquadGetFunction, TeamSquadGetFunctionType>(TeamSquadGetFunction)
    },
    sendMail: {
        contact: FirebaseFunctionDescriptor.create<typeof SendMailContactFunction, SendMailContactFunctionType>(SendMailContactFunction)
    },
    userAuthentication: {
        add: FirebaseFunctionDescriptor.create<typeof UserAuthenticationAddFunction, UserAuthenticationAddFunctionType>(UserAuthenticationAddFunction),
        check: FirebaseFunctionDescriptor.create<typeof UserAuthenticationCheckFunction, UserAuthenticationCheckFunctionType>(UserAuthenticationCheckFunction),
        acceptDecline: FirebaseFunctionDescriptor.create<typeof UserAuthenticationAcceptDeclineFunction, UserAuthenticationAcceptDeclineFunctionType>(UserAuthenticationAcceptDeclineFunction),
        getAllUnauthenticated: FirebaseFunctionDescriptor.create<typeof UserAuthenticationGetAllUnauthenticatedFunction, UserAuthenticationGetAllUnauthenticatedFunctionType>(UserAuthenticationGetAllUnauthenticatedFunction)
    }
} satisfies FirebaseFunctionsType;
