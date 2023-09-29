import { HttpsError, type ILogger, UtcDate, Guid } from 'firebase-function';
import { EmbedBuilder } from 'discord.js';

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

    export const title: Record<ReportGroupId, string> = {
        'dancing': 'Tanzen',
        'football-adults/first-team/game-report': '1. Mannschaft',
        'football-adults/general': 'Herrenfußball',
        'football-adults/second-team/game-report': '2. Mannschaft',
        'football-youth/c-youth/game-report': 'C-Jugend',
        'football-youth/e-youth/game-report': 'E-Jugend',
        'football-youth/f-youth/game-report': 'F-Jugend',
        'football-youth/g-youth/game-report': 'G-Jugend',
        'football-youth/general': 'Jugendfußball',
        'general': 'Allgemeines',
        'gymnastics': 'Gymnastik'
    };

    export function typeGuard(value: string): value is ReportGroupId {
        return (ReportGroupId.all as string[]).includes(value);
    }
}

export type Report = {
    id: Guid;
    title: string;
    message: string;
    imageUrl: string | null;
    createDate: UtcDate;
    discordMessageId: string | null;
};

export namespace Report {
    export function fromObject(value: object | null, logger: ILogger): Omit<Report, 'id' | 'discordMessageId'> {
        logger.log('Report.fromObject', { value: value });

        if (value === null)
            throw HttpsError('internal', 'Couldn\'t get report from null.', logger);

        if (!('title' in value) || typeof value.title !== 'string')
            throw HttpsError('internal', 'Couldn\'t get title for report.', logger);

        if (!('message' in value) || typeof value.message !== 'string')
            throw HttpsError('internal', 'Couldn\'t get message for report.', logger);

        if (!('createDate' in value) || typeof value.createDate !== 'string')
            throw HttpsError('internal', 'Couldn\'t get create date for report.', logger);

        if (!('imageUrl' in value) || !(typeof value.imageUrl === 'string' || value.imageUrl === null))
            throw HttpsError('internal', 'Couldn\'t get image url for report.', logger);

        return {
            title: value.title,
            message: value.message,
            imageUrl: value.imageUrl,
            createDate: UtcDate.decode(value.createDate)
        };
    }

    export type Flatten = {
        id: string;
        title: string;
        message: string;
        imageUrl: string | null;
        createDate: string;
        discordMessageId: string | null;
    };

    export function flatten(report: Report): Report.Flatten;
    export function flatten(report: Omit<Report, 'id'>): Omit<Report.Flatten, 'id'>;
    export function flatten(report: Report | Omit<Report, 'id'>): Report.Flatten | Omit<Report.Flatten, 'id'> {
        return {
            ...('id' in report ? { id: report.id.guidString } : {}),
            title: report.title,
            message: report.message,
            imageUrl: report.imageUrl,
            createDate: report.createDate.encoded,
            discordMessageId: report.discordMessageId
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
            createDate: UtcDate.decode(report.createDate),
            discordMessageId: report.discordMessageId
        };
    }

    export function addDiscordMessageId(report: Omit<Report, 'discordMessageId'>, discordMessageId: string | null): Report;
    export function addDiscordMessageId(report: Omit<Report, 'id' | 'discordMessageId'>, discordMessageId: string | null): Omit<Report, 'id'>;
    export function addDiscordMessageId(report: Omit<Report, 'discordMessageId'> | Omit<Report, 'id' | 'discordMessageId'>, discordMessageId: string | null): Report | Omit<Report, 'id'> {
        return {
            ...report,
            discordMessageId: discordMessageId
        };
    }

    export function discordEmbed(report: Omit<Report, 'id' | 'discordMessageId'>, groupId: ReportGroupId): EmbedBuilder {
        return new EmbedBuilder()
            .setTitle(`${ReportGroupId.title[groupId]} | ${report.title}`)
            .setDescription(report.message)
            .setThumbnail(report.imageUrl);
    }
}
