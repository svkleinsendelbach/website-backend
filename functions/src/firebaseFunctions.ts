import { FirebaseDescriptor, type FirebaseFunctions } from 'firebase-function';

import { DeleteAllDataFunction, type DeleteAllDataFunctionType } from './functions/DeleteAllDataFunction';
import { IcsEventsRequest, type IcsEventsRequestType } from './functions/IcsEventsRequest';
import { VerifyRecaptchaFunction, type VerifyRecaptchaFunctionType } from './functions/VerifyRecaptchaFunction';

import { EventGetFunction, type EventGetFunctionType } from './functions/EventGetFunction';
import { EventEditFunction, type EventEditFunctionType } from './functions/EventEditFunction';

import { ReportGetFunction, type ReportGetFunctionType } from './functions/ReportGetFunction';
import { ReportGetAllFunction, type ReportGetAllFunctionType } from './functions/ReportGetAllFunction';
import { ReportEditFunction, type ReportEditFunctionType } from './functions/ReportEditFunction';

import { OccupancyGetAllFunction, type OccupancyGetAllFunctionType } from './functions/OccupancyGetAllFunction';
import { OccupancyEditFunction, type OccupancyEditFunctionType } from './functions/OccupancyEditFunction';

import { CriticismSuggestionGetAllFunction, type CriticismSuggestionGetAllFunctionType } from './functions/CriticismSuggestionGetAllFunction';
import { CriticismSuggestionEditFunction, type CriticismSuggestionEditFunctionType } from './functions/CriticismSuggestionEditFunction';

import { GameInfoGetFunction, type GameInfoGetFunctionType } from './functions/GameInfoGetFunction';
import { TeamSquadGetFunction, type TeamSquadGetFunctionType } from './functions/TeamSquadGetFunction';

import { SendMailContactFunction, type SendMailContactFunctionType } from './functions/SendMailContactFunction';

import { UserRequestAccessFunction, type UserRequestAccessFunctionType } from './functions/UserRequestAccessFunction';
import { UserGetAllFunction, type UserGetAllFunctionType } from './functions/UserGetAllFunction';
import { UserCheckRolesFunction, type UserCheckRolesFunctionType } from './functions/UserCheckRolesFunction';
import { UserHandleAccessRequestFunction, type UserHandleAccessRequestFunctionType } from './functions/UserHandleAccessRequestFunction';
import { UserEditRolesFunction, type UserEditRolesFunctionType } from './functions/UserEditRolesFunction';

export const firebaseFunctions = {
    verifyRecaptcha: FirebaseDescriptor._function<VerifyRecaptchaFunctionType>(VerifyRecaptchaFunction),
    icsEvents: FirebaseDescriptor.request<IcsEventsRequestType>(IcsEventsRequest),
    deleteAllData: FirebaseDescriptor._function<DeleteAllDataFunctionType>(DeleteAllDataFunction),
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
        edit: FirebaseDescriptor._function<OccupancyEditFunctionType>(OccupancyEditFunction)
    },
    criticismSuggestion: {
        getAll: FirebaseDescriptor._function<CriticismSuggestionGetAllFunctionType>(CriticismSuggestionGetAllFunction),
        edit: FirebaseDescriptor._function<CriticismSuggestionEditFunctionType>(CriticismSuggestionEditFunction)
    },
    bfvData: {
        gameInfo: FirebaseDescriptor._function<GameInfoGetFunctionType>(GameInfoGetFunction),
        teamSquad: FirebaseDescriptor._function<TeamSquadGetFunctionType>(TeamSquadGetFunction)
    },
    sendMail: {
        contact: FirebaseDescriptor._function<SendMailContactFunctionType>(SendMailContactFunction)
    },
    user: {
        requestAccess: FirebaseDescriptor._function<UserRequestAccessFunctionType>(UserRequestAccessFunction),
        getAll: FirebaseDescriptor._function<UserGetAllFunctionType>(UserGetAllFunction),
        checkRoles: FirebaseDescriptor._function<UserCheckRolesFunctionType>(UserCheckRolesFunction),
        handleAccessRequest: FirebaseDescriptor._function<UserHandleAccessRequestFunctionType>(UserHandleAccessRequestFunction),
        editRoles: FirebaseDescriptor._function<UserEditRolesFunctionType>(UserEditRolesFunction)
    }
} satisfies FirebaseFunctions;
