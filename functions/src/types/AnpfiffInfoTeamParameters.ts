import { HttpsError, ILogger } from "firebase-function";

export type AnpfiffInfoTeamParameters = {
    ligaId: number;
    men: number;
    saisonId: number;
    spielkreis: number;
    teamId: number;
    vereinId: number;
};

export namespace AnpfiffInfoTeamParameters {
    export function fromObject(value: object | null, logger: ILogger): AnpfiffInfoTeamParameters {
        logger.log('AnpfiffInfoTeamParameters.fromObject', { value: value });

        if (value === null)
            throw HttpsError('internal', 'Couldn\'t get parameters from null.', logger);

        if (!('ligaId' in value) || typeof value.ligaId !== 'number')
            throw HttpsError('internal', 'Couldn\'t get ligaId for parameters.', logger);

        if (!('men' in value) || typeof value.men !== 'number')
            throw HttpsError('internal', 'Couldn\'t get men for parameters.', logger);

        if (!('saisonId' in value) || typeof value.saisonId !== 'number')
            throw HttpsError('internal', 'Couldn\'t get saisonId for parameters.', logger);

        if (!('spielkreis' in value) || typeof value.spielkreis !== 'number')
            throw HttpsError('internal', 'Couldn\'t get spielkreis for parameters.', logger);

        if (!('teamId' in value) || typeof value.teamId !== 'number')
            throw HttpsError('internal', 'Couldn\'t get teamId for parameters.', logger);

        if (!('vereinId' in value) || typeof value.vereinId !== 'number')
            throw HttpsError('internal', 'Couldn\'t get vereinId for parameters.', logger);

        return {
            ligaId: value.ligaId,
            men: value.men,
            saisonId: value.saisonId,
            spielkreis: value.spielkreis,
            teamId: value.teamId,
            vereinId: value.vereinId
        };
    }
}