import { DatabaseType } from '../classes/DatabaseType';
import { FirebaseDatabase } from './FirebaseDatabase';
import { Logger } from './Logger';

export interface AnpfiffTeamParameter {
    ligaId: number,
    men: number,
    saisonId: number,
    spielkreis: number,
    teamId: number,
    vereinId: number
}

export namespace AnpfiffTeamParameter {
    export type Type = 'first-team' | 'second-team';

    export namespace Type {
        export function typeGuard(value: string): value is Type {
            return value === 'first-team' || value === 'second-team';
        }
    }
}

export async function getAnpfiffTeamParameter(type: AnpfiffTeamParameter.Type, databaseType: DatabaseType, logger: Logger): Promise<AnpfiffTeamParameter> {
    logger.log('getAnpfiffTeamParameter', { type, databaseType });
    const reference = FirebaseDatabase.Reference.fromPath(`anpfiffTeamParameter/${type}`, databaseType);
    const snapshot = await reference.snapshot<AnpfiffTeamParameter>();
    return snapshot.value;
}
