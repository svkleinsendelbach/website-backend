import { HttpsError, type ILogger, IDatabaseReference } from 'firebase-function';
import { DatabaseScheme } from '../DatabaseScheme';

export type AnpfiffInfoTeamParameters = {
    ligaId: number;
    men: number;
    saisonId: number;
    spielkreis: number;
    teamId: number;
    vereinId: number;
};

export namespace AnpfiffInfoTeamParameters {
    export type Type = 'first-team' | 'second-team';

    export namespace Type {
        export function typeGuard(value: string): value is Type {
            return ['first-team', 'second-team'].includes(value);
        }
    }

    export async function fetchFromDatabase(type: AnpfiffInfoTeamParameters.Type, databaseReference: IDatabaseReference<DatabaseScheme>, logger: ILogger): Promise<AnpfiffInfoTeamParameters> {
        logger.log('AnpfiffInfoTeamParameters.fetchFromDatabase', { type: type });
        const reference = databaseReference.child('anpfiffInfoTeamParameters').child(type);
        const snapshot = await reference.snapshot();
        if (!snapshot.exists)
            throw HttpsError('internal', 'Couldn\'t get anpfiff info team parameters.', logger);
        return snapshot.value();
    }
}
