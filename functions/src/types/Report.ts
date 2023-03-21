import { HttpsError, type ILogger } from 'firebase-function';
import { Guid } from './Guid';

export type ReportGroupId =
    'general' |
    'football-adults/first-team/game-report' |
    'football-adults/second-team/game-report' |
    'football-youth/c-youth/game-report' |
    'football-youth/e-youth/game-report' |
    'football-youth/f-youth/game-report' |
    'football-youth/g-youth/game-report';

export namespace ReportGroupId {
    export function typeGuard(value: string): value is ReportGroupId {
        return [
            'general', 'football-adults/first-team/game-report', 'football-adults/second-team/game-report', 'football-youth/c-youth/game-report',
            'football-youth/e-youth/game-report', 'football-youth/f-youth/game-report', 'football-youth/g-youth/game-report'
        ].includes(value);
    }

    export const all: ReportGroupId[] = [
        'general',
        'football-adults/first-team/game-report',
        'football-adults/second-team/game-report',
        'football-youth/c-youth/game-report',
        'football-youth/e-youth/game-report',
        'football-youth/f-youth/game-report',
        'football-youth/g-youth/game-report'
    ];
}

export type Report = {
    id: Guid;
    message: string;
    createDate: Date;
};

export namespace Report {
    export function fromObject(value: object | null, logger: ILogger): Omit<Report, 'id'> {
        logger.log('Report.fromObject', { value: value });

        if (value === null)
            throw HttpsError('internal', 'Couldn\'t get report from null.', logger);

        if (!('message' in value) || typeof value.message !== 'string')
            throw HttpsError('internal', 'Couldn\'t get message for report.', logger);

        if (!('createDate' in value) || typeof value.createDate !== 'string')
            throw HttpsError('internal', 'Couldn\'t get create date for report.', logger);

        return {
            message: value.message,
            createDate: new Date(value.createDate)
        };
    }

    export type Flatten = {
        id: string;
        message: string;
        createDate: string;
    };

    export function flatten(report: Report): Report.Flatten;
    export function flatten(report: Omit<Report, 'id'>): Omit<Report.Flatten, 'id'>;
    export function flatten(report: Report | Omit<Report, 'id'>): Report.Flatten | Omit<Report.Flatten, 'id'> {
        return {
            ...('id' in report ? { id: report.id.guidString } : {}),
            message: report.message,
            createDate: report.createDate.toISOString()
        };
    }

    export function concrete(report: Report.Flatten): Report;
    export function concrete(report: Omit<Report.Flatten, 'id'>): Omit<Report, 'id'>;
    export function concrete(report: Report.Flatten | Omit<Report.Flatten, 'id'>): Report | Omit<Report, 'id'> {
        return {
            ...('id' in report ? { id: new Guid(report.id) } : {}),
            message: report.message,
            createDate: new Date(report.createDate)
        };
    }
}
