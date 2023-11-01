import { HttpsError, ILogger, Guid } from "firebase-function";
import { EmbedBuilder } from "discord.js";

export type CriticismSuggestion = {
    id: Guid;
    type: CriticismSuggestion.Type;
    title: string;
    description: string;
    workedOff: boolean;
};

export namespace CriticismSuggestion {
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
    
    export function fromObject(value: object | null, logger: ILogger): Omit<CriticismSuggestion, 'id'> {
        logger.log('CriticismSuggestion.fromObject', { value: value });

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
        type: CriticismSuggestion.Type;
        title: string;
        description: string;
        workedOff: boolean;
    };

    export function flatten(criticismSuggestion: CriticismSuggestion): CriticismSuggestion.Flatten;
    export function flatten(criticismSuggestion: Omit<CriticismSuggestion, 'id'>): Omit<CriticismSuggestion.Flatten, 'id'>;
    export function flatten(criticismSuggestion: CriticismSuggestion | Omit<CriticismSuggestion, 'id'>): CriticismSuggestion.Flatten | Omit<CriticismSuggestion.Flatten, 'id'> {
        return {
            ...('id' in criticismSuggestion ? { id: criticismSuggestion.id.guidString } : {}),
            type: criticismSuggestion.type,
            title: criticismSuggestion.title,
            description: criticismSuggestion.description,
            workedOff: criticismSuggestion.workedOff
        };
    }

    export function concrete(criticismSuggestion: CriticismSuggestion.Flatten): CriticismSuggestion;
    export function concrete(criticismSuggestion: Omit<CriticismSuggestion.Flatten, 'id'>): Omit<CriticismSuggestion, 'id'>;
    export function concrete(criticismSuggestion: CriticismSuggestion.Flatten | Omit<CriticismSuggestion.Flatten, 'id'>): CriticismSuggestion | Omit<CriticismSuggestion, 'id'> {
        return {
            ...('id' in criticismSuggestion ? { id: new Guid(criticismSuggestion.id) } : {}),
            type: criticismSuggestion.type,
            title: criticismSuggestion.title,
            description: criticismSuggestion.description,
            workedOff: criticismSuggestion.workedOff
        };
    }

    export function discordEmbed(criticismSuggestion: Omit<CriticismSuggestion, 'id'>): EmbedBuilder {
        return new EmbedBuilder()
            .setColor(criticismSuggestion.type === 'criticism' ? 0xAD2121 : 0x1E90FF)
            .setTitle(`${Type.title[criticismSuggestion.type]} | ${criticismSuggestion.title}`)
            .setDescription(criticismSuggestion.description);
    }
}