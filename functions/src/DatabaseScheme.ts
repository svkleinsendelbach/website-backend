import { type CryptedScheme, type DatabaseSchemeType } from 'firebase-function';
import { type AnpfiffInfoTeamParameters } from './types/AnpfiffInfoTeamParameters';
import { type Event, type EventGroupId } from './types/Event';
import { type News } from './types/News';
import { type Report, type ReportGroupId } from './types/Report';
import { type UserAuthentication, type UserAuthenticationType } from './types/UserAuthentication';

export type DatabaseScheme = DatabaseSchemeType<{
    anpfiffInfoTeamParameters: {
        [Key in AnpfiffInfoTeamParameters.Type]: AnpfiffInfoTeamParameters
    };
    events: {
        [Key in EventGroupId]: {
            [Key in string]: CryptedScheme<Omit<Event.Flatten, 'id'>>
        }
    };
    news: {
        [Key in string]: CryptedScheme<Omit<News.Flatten, 'id'>>
    };
    reports: {
        [Key in ReportGroupId]: {
            [Key in string]: CryptedScheme<Omit<Report.Flatten, 'id'>>
        }
    };
    users: {
        authentication: {
            [Key in UserAuthenticationType]: {
                [Key in string]: CryptedScheme<UserAuthentication>
            };
        };
    };
}>;
