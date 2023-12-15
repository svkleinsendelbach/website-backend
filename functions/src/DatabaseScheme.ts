import { type CryptedScheme } from 'firebase-function';
import { type Event, type EventGroupId as EventGroupIds } from './types/Event';
import { type Report, type ReportGroupId as ReportGroupIds } from './types/Report';
import { User } from './types/User';
import { Occupancy } from './types/Occupancy';
import { Criticism } from './types/Criticism';
import { Newsletter } from './types/Newsletter';

export type DatabaseScheme = {
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
    newsletter: {
        [NewsletterId in string]: CryptedScheme<Omit<Newsletter.Flatten, 'id'>>;
    };
    'newsletter-subscriptions': {
        [SubscriberId in string]: CryptedScheme<string>;
    };
    occupancies: {
        [OccupancyId in string]: CryptedScheme<Omit<Occupancy.Flatten, 'id'>>;
    };
    criticisms: {
        [CriticismId in string]: CryptedScheme<Omit<Criticism, 'id'>>;
    };
    users: {
        [HashedUserId in string]: CryptedScheme<Omit<User, 'hashedUserId'>>
    };
};
