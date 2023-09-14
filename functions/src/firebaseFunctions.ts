import { FirebaseFunctionDescriptor, type FirebaseFunctions } from 'firebase-function';

import { DeleteAllDataFunction, type DeleteAllDataFunctionType } from './functions/DeleteAllDataFunction';
import { VerifyRecaptchaFunction, type VerifyRecaptchaFunctionType } from './functions/VerifyRecaptchaFunction';

import { EventGetFunction, type EventGetFunctionType } from './functions/EventGetFunction';
import { EventEditFunction, type EventEditFunctionType } from './functions/EventEditFunction';

import { ReportGetFunction, type ReportGetFunctionType } from './functions/ReportGetFunction';
import { ReportGetAllFunction, type ReportGetAllFunctionType } from './functions/ReportGetAllFunction';
import { ReportEditFunction, type ReportEditFunctionType } from './functions/ReportEditFunction';

import { OccupancyGetAllFunction, type OccupancyGetAllFunctionType } from './functions/OccupancyGetAllFunction';
import { OccupancyEditFunction, type OccupancyEditFunctionType } from './functions/OccupancyEditFunction';

import { GameInfoGetFunction, type GameInfoGetFunctionType } from './functions/GameInfoGetFunction';
import { TeamSquadGetFunction, type TeamSquadGetFunctionType } from './functions/TeamSquadGetFunction';

import { SendMailContactFunction, type SendMailContactFunctionType } from './functions/SendMailContactFunction';

import { UserRequestAccessFunction, type UserRequestAccessFunctionType } from './functions/UserRequestAccessFunction';
import { UserGetAllFunction, type UserGetAllFunctionType } from './functions/UserGetAllFunction';
import { UserCheckRolesFunction, type UserCheckRolesFunctionType } from './functions/UserCheckRolesFunction';
import { UserHandleAccessRequestFunction, type UserHandleAccessRequestFunctionType } from './functions/UserHandleAccessRequestFunction';
import { UserEditRolesFunction, type UserEditRolesFunctionType } from './functions/UserEditRolesFunction';

export const firebaseFunctions = {
    verifyRecaptcha: FirebaseFunctionDescriptor.create<VerifyRecaptchaFunctionType>(VerifyRecaptchaFunction),
    deleteAllData: FirebaseFunctionDescriptor.create<DeleteAllDataFunctionType>(DeleteAllDataFunction),
    event: {
        get: FirebaseFunctionDescriptor.create<EventGetFunctionType>(EventGetFunction),
        edit: FirebaseFunctionDescriptor.create<EventEditFunctionType>(EventEditFunction)
    },
    report: {
        get: FirebaseFunctionDescriptor.create<ReportGetFunctionType>(ReportGetFunction),
        getAll: FirebaseFunctionDescriptor.create<ReportGetAllFunctionType>(ReportGetAllFunction),
        edit: FirebaseFunctionDescriptor.create<ReportEditFunctionType>(ReportEditFunction)
    },
    occupancy: {
        getAll: FirebaseFunctionDescriptor.create<OccupancyGetAllFunctionType>(OccupancyGetAllFunction),
        edit: FirebaseFunctionDescriptor.create<OccupancyEditFunctionType>(OccupancyEditFunction)
    },
    bfvData: {
        gameInfo: FirebaseFunctionDescriptor.create<GameInfoGetFunctionType>(GameInfoGetFunction),
        teamSquad: FirebaseFunctionDescriptor.create<TeamSquadGetFunctionType>(TeamSquadGetFunction)
    },
    sendMail: {
        contact: FirebaseFunctionDescriptor.create<SendMailContactFunctionType>(SendMailContactFunction)
    },
    user: {
        requestAccess: FirebaseFunctionDescriptor.create<UserRequestAccessFunctionType>(UserRequestAccessFunction),
        getAll: FirebaseFunctionDescriptor.create<UserGetAllFunctionType>(UserGetAllFunction),
        checkRoles: FirebaseFunctionDescriptor.create<UserCheckRolesFunctionType>(UserCheckRolesFunction),
        handleAccessRequest: FirebaseFunctionDescriptor.create<UserHandleAccessRequestFunctionType>(UserHandleAccessRequestFunction),
        editRoles: FirebaseFunctionDescriptor.create<UserEditRolesFunctionType>(UserEditRolesFunction)
    }
} satisfies FirebaseFunctions;
