import { PersonParameters } from '../../Parameters/PersonParameters';

/** @see {isTeamKader} ts-auto-guard:type-guard */
export interface TeamKader {
  kader?: {
    torwart?: TeamKaderPerson[];
    abwehr?: TeamKaderPerson[];
    mittelfeld?: TeamKaderPerson[];
    sturm?: TeamKaderPerson[];
    ohneAngabe?: TeamKaderPerson[];
  };
  coach?: {
    imageId?: number;
    name?: string;
    personParameters?: PersonParameters;
    age?: number;
  };
  stab?: {
    imageId?: number;
    function?: string;
    name?: string;
    personParameters?: PersonParameters;
  }[];
}

export interface TeamKaderPerson {
  imageId?: number;
  firstName?: string;
  lastName?: string;
  personParameters?: PersonParameters;
  age?: number;
  inSquad?: number;
  goals?: number;
  assists?: number;
}
