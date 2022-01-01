import { TeamParameters } from '../../Parameters/TeamParameters';

/** @see {isLigaStart} ts-auto-guard:type-guard */
export interface LigaStart {
  teams?: {
    logoId?: number;
    teamParameters?: TeamParameters;
  }[];
}
