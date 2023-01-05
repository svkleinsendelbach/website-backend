import { PersonParameters } from '../PersonParameters';

export interface TeamSquad {
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
    personParameters: PersonParameters | null;
    age: number | null;
  } | null;
  stab: {
    imageId: number | null;
    function: string | null;
    name: string | null;
    personParameters: PersonParameters | null;
  }[];
}

export namespace TeamSquad {
    export interface Person {
        imageId: number | null;
        firstName: string | null;
        lastName: string | null;
        personParameters: PersonParameters | null;
        age: number | null;
        countInSquad: number | null;
        goals: number | null;
        assists: number | null;
    }
} 

