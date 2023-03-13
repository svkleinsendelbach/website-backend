import { HttpsError, type ILogger } from 'firebase-function';

export interface News {
    id: string;
    title: string;
    subtitle?: string;
    date: Date;
    shortDescription?: string;
    newsUrl: string;
    disabled: boolean;
    thumbnailUrl: string;
}

export namespace News {
    export function fromObject(value: object | null, logger: ILogger): Omit<News, 'id'> {
        logger.log('News.fromObject', { value: value });

        if (value === null)
            throw HttpsError('internal', 'Couldn\'t get news from null.', logger);

        if (!('title' in value) || typeof value.title !== 'string')
            throw HttpsError('internal', 'Couldn\'t get title for news.', logger);

        if ('subtitle' in value && (typeof value.subtitle !== 'string' && value.subtitle !== undefined))
            throw HttpsError('internal', 'Couldn\'t get subtitle for news.', logger);

        if (!('date' in value) || typeof value.date !== 'string')
            throw HttpsError('internal', 'Couldn\'t get date for news.', logger);

        if ('shortDescription' in value && (typeof value.shortDescription !== 'string' && value.shortDescription !== undefined))
            throw HttpsError('internal', 'Couldn\'t get shortDescription for news.', logger);

        if (!('newsUrl' in value) || typeof value.newsUrl !== 'string')
            throw HttpsError('internal', 'Couldn\'t get newsUrl for news.', logger);

        if (!('disabled' in value) || typeof value.disabled !== 'boolean')
            throw HttpsError('internal', 'Couldn\'t get disabled for news.', logger);

        if (!('thumbnailUrl' in value) || typeof value.thumbnailUrl !== 'string')
            throw HttpsError('internal', 'Couldn\'t get thumbnailUrl for news.', logger);

        return {
            title: value.title,
            subtitle: 'subtitle' in value ? value.subtitle as string : undefined,
            date: new Date(value.date),
            shortDescription: 'shortDescription' in value ? value.shortDescription as string : undefined,
            newsUrl: value.newsUrl,
            disabled: value.disabled,
            thumbnailUrl: value.thumbnailUrl
        };
    }

    export type Flatten = {
        id: string;
        title: string;
        subtitle?: string;
        date: string;
        shortDescription?: string;
        newsUrl: string;
        disabled: boolean;
        thumbnailUrl: string;
    };

    export function flatten(news: News): News.Flatten;
    export function flatten(news: Omit<News, 'id'>): Omit<News.Flatten, 'id'>;
    export function flatten(news: News | Omit<News, 'id'>): News.Flatten | Omit<News.Flatten, 'id'> {
        return {
            ...('id' in news ? { id: news.id } : {}),
            title: news.title,
            subtitle: news.subtitle,
            date: news.date.toISOString(),
            shortDescription: news.shortDescription,
            newsUrl: news.newsUrl,
            disabled: news.disabled,
            thumbnailUrl: news.thumbnailUrl
        };
    }

    export function concrete(news: News.Flatten): News;
    export function concrete(news: Omit<News.Flatten, 'id'>): Omit<News, 'id'>;
    export function concrete(news: News.Flatten | Omit<News.Flatten, 'id'>): News | Omit<News, 'id'> {
        return {
            ...('id' in news ? { id: news.id } : {}),
            title: news.title,
            subtitle: news.subtitle,
            date: new Date(news.date),
            shortDescription: news.shortDescription,
            newsUrl: news.newsUrl,
            disabled: news.disabled,
            thumbnailUrl: news.thumbnailUrl
        };
    }
}
