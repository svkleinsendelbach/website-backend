import { XmlDocument } from 'fsp-xml-parser';

import { WebserviceFetcher } from '../../Fetchers/WebserviceFetcher';
import { TeamParameters } from '../../Parameters/TeamParameters';
import { isTeamParameters } from '../../Parameters/TeamParameters.guard';
import { DateOffset, DEFAULT_DATE_OFFSET } from '../../utils';
import { PersonBilderParser } from '../PersonBilder/PersonBilderParser';
import { TeamBilder } from './TeamBilder';
import { isTeamBilder } from './TeamBilder.guard';

export class TeamBilderParser implements WebserviceFetcher.Parser<TeamParameters, TeamBilder> {
  public parametersGuard: (obj: any) => obj is TeamParameters = isTeamParameters;

  public getUrl(parameters: TeamParameters & { rowVon: number; rowBis: number }): string {
    return `http://www.anpfiff.info/Webservices/WS_Archiv.asmx/GetBilder?intSKID=${parameters.spielkreis}&intSaisID=${
      parameters.saisonId
    }&intMonat=0&intRubID=0&intPersID=0&intTmID=${parameters.teamId}&intVerID=${parameters.vereinId}&intRowVon=${
      parameters.rowVon
    }&intRowBis=${parameters.rowBis + 1}`;
  }

  public readonly dateOffset: DateOffset = DEFAULT_DATE_OFFSET;

  public interfaceGuard: (obj: any) => obj is TeamBilder = isTeamBilder;

  public parseWebservice(dom: XmlDocument): TeamBilder[] | undefined {
    const parser = new PersonBilderParser();
    return parser.parseWebservice(dom);
  }
}
