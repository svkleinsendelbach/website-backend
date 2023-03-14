import { HttpsError, type ILogger } from 'firebase-function';

export type NotificationType = 'general' | 'football';

export namespace NotificationType {
    export function typeGuard(value: string): value is NotificationType {
        return ['general', 'football'].includes(value);
    }
}

export interface NotifactionPayload {
    title: string;
    body: string;
}

export namespace NotifactionPayload {
    export function fromObject(value: object | null, logger: ILogger): NotifactionPayload {
        logger.log('Event.fromObject', { value: value });

        if (value === null)
            throw HttpsError('internal', 'Couldn\'t get notification payload from null.', logger);

        if (!('title' in value) || typeof value.title !== 'string')
            throw HttpsError('internal', 'Couldn\'t get title for notification payload.', logger);

        if (!('body' in value) || typeof value.body !== 'string')
            throw HttpsError('internal', 'Couldn\'t get body for notification payload.', logger);

        return {
            title: value.title,
            body: value.body
        };
    }
}
