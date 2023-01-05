import { Logger } from '../utils/Logger';
import { httpsError } from '../utils/utils';

export interface News {
    id: string,
    title: string;
    subtitle?: string;
    date: Date;
    shortDescription?: string;
    newsUrl: string;
    disabled: boolean;
    thumbnailUrl: string;
}

export namespace News {
    export function fromObject(value: object, logger: Logger): Omit<News, 'id'> {
        logger.log('News.fromObject', { value });
                
        if (!('title' in value) || typeof value.title !== 'string')
            throw httpsError('internal', 'Couldn\'t get title for news.', logger);
        
        if ('subtitle' in value && (typeof value.subtitle !== 'string' && value.subtitle !== undefined))
            throw httpsError('internal', 'Couldn\'t get subtitle for news.', logger);

        if (!('date' in value) || typeof value.date !== 'string')
            throw httpsError('internal', 'Couldn\'t get date for news.', logger);

        if ('shortDescription' in value && (typeof value.shortDescription !== 'string' && value.shortDescription !== undefined))
            throw httpsError('internal', 'Couldn\'t get shortDescription for news.', logger);
        
        if (!('newsUrl' in value) || typeof value.newsUrl !== 'string')
            throw httpsError('internal', 'Couldn\'t get newsUrl for news.', logger);
        
        if (!('disabled' in value) || typeof value.disabled !== 'boolean')
            throw httpsError('internal', 'Couldn\'t get disabled for news.', logger);
    
        if (!('thumbnailUrl' in value) || typeof value.thumbnailUrl !== 'string')
            throw httpsError('internal', 'Couldn\'t get thumbnailUrl for news.', logger);

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

    export type CallParameters = {
        title: string;
        subtitle?: string;
        date: string;
        shortDescription?: string;
        newsUrl: string;
        disabled: boolean;
        thumbnailUrl: string;
    }

    export interface ReturnType {
        id: string,
        title: string;
        subtitle?: string;
        date: string;
        shortDescription?: string;
        newsUrl: string;
        disabled: boolean;
        thumbnailUrl: string;
    }
}
