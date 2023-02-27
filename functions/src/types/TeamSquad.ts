import { type AnpfiffInfoPersonParameters } from './AnpfiffInfoPersonParameters';

export type TeamSquad = {
    squad: {
        goalkeeper: TeamSquad.Person[];
        defence: TeamSquad.Person[];
        midfield: TeamSquad.Person[];
        offence: TeamSquad.Person[];
        notSpecified: TeamSquad.Person[];
    };
    coach: {
        imageId: number | null;
        name: string | null;
        personParameters: AnpfiffInfoPersonParameters | null;
        age: number | null;
    } | null;
    stab: Array<{
        imageId: number | null;
        function: string | null;
        name: string | null;
        personParameters: AnpfiffInfoPersonParameters | null;
    }>;
};

export namespace TeamSquad {
    export type Person = {
        imageId: number | null;
        firstName: string | null;
        lastName: string | null;
        personParameters: AnpfiffInfoPersonParameters | null;
        age: number | null;
        countInSquad: number | null;
        goals: number | null;
        assists: number | null;
    };
}
