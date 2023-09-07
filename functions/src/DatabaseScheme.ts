import { type CryptedScheme, type DatabaseSchemeType } from 'firebase-function';
import { type AnpfiffInfoTeamParameters } from './types/AnpfiffInfoTeamParameters';
import { type Event, type EventGroupId as EventGroupIds } from './types/Event';
import { type Report, type ReportGroupId as ReportGroupIds } from './types/Report';
import { User } from './types/User';

export type DatabaseScheme = DatabaseSchemeType<{
    anpfiffInfoTeamParameters: {
        [Type in AnpfiffInfoTeamParameters.Type]: AnpfiffInfoTeamParameters;
    };
    events:{
        [EventGroupId in EventGroupIds]: {
            [EventId in string]: CryptedScheme<Omit<Event.Flatten, 'id'>>;
        };
    };
    reports: {
        [ReportGroupId in ReportGroupIds]: {
            [ReportId in string]: CryptedScheme<Omit<Report.Flatten, 'id'>>;
        };
    };
    users: {
        [HashedUserId in string]: CryptedScheme<Omit<User, 'hashedUserId'>>
    };
}>;
