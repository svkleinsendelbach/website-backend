import { DatabaseReference, type CryptedScheme, type DatabaseSchemeType, DatabaseType } from 'firebase-function';
import { type AnpfiffInfoTeamParameters } from './types/AnpfiffInfoTeamParameters';
import { type Event, type EventGroupId as EventGroupIds } from './types/Event';
import { type Report, type ReportGroupId as ReportGroupIds } from './types/Report';
import { User } from './types/User';
import { Occupancy } from './types/Occupancy';
import { CriticismSuggestion } from './types/CriticismSuggestion';
import { getPrivateKeys } from './privateKeys';

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
    occupancies: {
        [OccupancyId in string]: CryptedScheme<Omit<Occupancy.Flatten, 'id'>>;
    };
    criticismSuggestions: {
        [CriticismSuggestionId in string]: CryptedScheme<Omit<CriticismSuggestion, 'id'>>;
    };
    users: {
        [HashedUserId in string]: CryptedScheme<Omit<User, 'hashedUserId'>>
    };
}>;

export namespace DatabaseScheme {
    export function reference(databaseType: DatabaseType): DatabaseReference<DatabaseScheme> {
        return DatabaseReference.base<DatabaseScheme>(getPrivateKeys(databaseType));
    }
}