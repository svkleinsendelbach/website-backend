import { HttpsError, ILogger, Guid } from "firebase-function";
import { EmbedBuilder } from "discord.js";

export type Criticism = {
    id: Guid;
    type: Criticism.Type;
    title: string;
    description: string;
    workedOff: boolean;
};

export namespace Criticism {
    export type Type = 'criticism' | 'suggestion';

    export namespace Type {
        export function typeGuard(value: string): value is Type {
            return value === 'criticism' || value === 'suggestion';
        }

        export const title: Record<Type, string> = {
            criticism: 'Kritik',
            suggestion: 'Vorschlag'
        };
    }
    
    export function fromObject(value: object | null, logger: ILogger): Omit<Criticism, 'id'> {
        logger.log('Criticism.fromObject', { value: value });

        if (value === null)
            throw HttpsError('internal', 'Couldn\'t get criticism suggestion from null.', logger);

        if (!('type' in value) || typeof value.type !== 'string' || !Type.typeGuard(value.type))
            throw HttpsError('internal', 'Couldn\'t get type for criticism suggestion.', logger);

        if (!('title' in value) || typeof value.title !== 'string')
            throw HttpsError('internal', 'Couldn\'t get title for criticism suggestion.', logger);

        if (!('description' in value) || typeof value.description !== 'string')
            throw HttpsError('internal', 'Couldn\'t get description for criticism suggestion.', logger);

        if (!('workedOff' in value) || typeof value.workedOff !== 'boolean')
            throw HttpsError('internal', 'Couldn\'t get worked off for criticism suggestion.', logger);

        return {
            type: value.type,
            title: value.title,
            description: value.description,
            workedOff: value.workedOff
        };
    }

    export type Flatten = {
        id: string;
        type: Criticism.Type;
        title: string;
        description: string;
        workedOff: boolean;
    };

    export function flatten(criticism: Criticism): Criticism.Flatten;
    export function flatten(criticism: Omit<Criticism, 'id'>): Omit<Criticism.Flatten, 'id'>;
    export function flatten(criticism: Criticism | Omit<Criticism, 'id'>): Criticism.Flatten | Omit<Criticism.Flatten, 'id'> {
        return {
            ...('id' in criticism ? { id: criticism.id.guidString } : {}),
            type: criticism.type,
            title: criticism.title,
            description: criticism.description,
            workedOff: criticism.workedOff
        };
    }

    export function concrete(criticism: Criticism.Flatten): Criticism;
    export function concrete(criticism: Omit<Criticism.Flatten, 'id'>): Omit<Criticism, 'id'>;
    export function concrete(criticism: Criticism.Flatten | Omit<Criticism.Flatten, 'id'>): Criticism | Omit<Criticism, 'id'> {
        return {
            ...('id' in criticism ? { id: new Guid(criticism.id) } : {}),
            type: criticism.type,
            title: criticism.title,
            description: criticism.description,
            workedOff: criticism.workedOff
        };
    }

    export function discordEmbed(criticism: Omit<Criticism, 'id'>): EmbedBuilder {
        return new EmbedBuilder()
            .setColor(criticism.type === 'criticism' ? 0xAD2121 : 0x1E90FF)
            .setTitle(`${Type.title[criticism.type]} | ${criticism.title}`)
            .setDescription(criticism.description);
    }
}