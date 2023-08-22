import { HttpsError, type ILogger, UtcDate } from 'firebase-function';
import { Guid } from './Guid';

export type ReportGroupId =
    'general' |
    'football-adults/general' |
    'football-adults/first-team/game-report' |
    'football-adults/second-team/game-report' |
    'football-youth/general' |
    'football-youth/c-youth/game-report' |
    'football-youth/e-youth/game-report' |
    'football-youth/f-youth/game-report' |
    'football-youth/g-youth/game-report' |
    'gymnastics' |
    'dancing';

export namespace ReportGroupId {
    export const all: ReportGroupId[] = [
        'general', 'football-adults/general', 'football-adults/first-team/game-report', 'football-adults/second-team/game-report', 'football-youth/general',
        'football-youth/c-youth/game-report', 'football-youth/e-youth/game-report', 'football-youth/f-youth/game-report', 'football-youth/g-youth/game-report',
        'gymnastics', 'dancing'
    ];

    export function typeGuard(value: string): value is ReportGroupId {
        return (ReportGroupId.all as string[]).includes(value);
    }
}

export type Report = {
    id: Guid;
    title: string;
    message: string;
    imageUrl?: string;
    createDate: UtcDate;
};

export namespace Report {
    export function fromObject(value: object | null, logger: ILogger): Omit<Report, 'id'> {
        logger.log('Report.fromObject', { value: value });

        if (value === null)
            throw HttpsError('internal', 'Couldn\'t get report from null.', logger);

        if (!('title' in value) || typeof value.title !== 'string')
            throw HttpsError('internal', 'Couldn\'t get title for report.', logger);

        if (!('message' in value) || typeof value.message !== 'string')
            throw HttpsError('internal', 'Couldn\'t get message for report.', logger);

        if (!('createDate' in value) || typeof value.createDate !== 'string')
            throw HttpsError('internal', 'Couldn\'t get create date for report.', logger);

        if ('imageUrl' in value && (typeof value.imageUrl !== 'string' && value.imageUrl !== undefined))
            throw HttpsError('internal', 'Couldn\'t get image url for report.', logger);

        return {
            title: value.title,
            message: value.message,
            imageUrl: 'imageUrl' in value ? value.imageUrl as string : undefined,
            createDate: UtcDate.decode(value.createDate)
        };
    }

    export type Flatten = {
        id: string;
        title: string;
        message: string;
        imageUrl?: string | undefined;
        createDate: string;
    };

    export function flatten(report: Report): Report.Flatten;
    export function flatten(report: Omit<Report, 'id'>): Omit<Report.Flatten, 'id'>;
    export function flatten(report: Report | Omit<Report, 'id'>): Report.Flatten | Omit<Report.Flatten, 'id'> {
        return {
            ...('id' in report ? { id: report.id.guidString } : {}),
            title: report.title,
            message: report.message,
            imageUrl: report.imageUrl,
            createDate: report.createDate.encoded
        };
    }

    export function concrete(report: Report.Flatten): Report;
    export function concrete(report: Omit<Report.Flatten, 'id'>): Omit<Report, 'id'>;
    export function concrete(report: Report.Flatten | Omit<Report.Flatten, 'id'>): Report | Omit<Report, 'id'> {
        return {
            ...('id' in report ? { id: new Guid(report.id) } : {}),
            title: report.title,
            message: report.message,
            imageUrl: report.imageUrl,
            createDate: UtcDate.decode(report.createDate)
        };
    }
}
