export type AnpfiffTeamParameter = {
    ligaId: number;
    men: number;
    saisonId: number;
    spielkreis: number;
    teamId: number;
    vereinId: number;
};

export namespace AnpfiffTeamParameter {
    export type Type = 'first-team' | 'second-team';

    export namespace Type {
        export function typeGuard(value: string): value is Type {
            return ['first-team', 'second-team'].includes(value);
        }
    }
}
