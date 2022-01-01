import DOMParser from 'dom-parser';

import { WebsiteFetcher } from '../../Fetchers/WebsiteFetcher';
import { HtmlNodeParser } from '../../NodeParser/HtmlNodeParser';
import { LigaParameters } from '../../Parameters/LigaParameters';
import { isLigaParameters } from '../../Parameters/LigaParameters.guard';
import { getImageId } from '../../Parameters/Parameters';
import { getTeamParameters } from '../../Parameters/TeamParameters';
import { DateOffset, DEFAULT_DATE_OFFSET } from '../../utils';
import { LigaStart } from './LigaStart';
import { isLigaStart } from './LigaStart.guard';

export class LigaStartParser implements WebsiteFetcher.Parser<LigaParameters, LigaStart> {
  public parametersGuard: (obj: any) => obj is LigaParameters = isLigaParameters;

  public getUrl(parameters: LigaParameters): string {
    return `http://www.anpfiff.info/sites/liga/start.aspx?SK=${parameters.spielkreis}&Rub=${parameters.rubrik}&Lg=${parameters.liga}&Sais&${parameters.saison}&Men=${parameters.men}`;
  }

  public readonly dateOffset: DateOffset = DEFAULT_DATE_OFFSET;

  public interfaceGuard: (obj: any) => obj is LigaStart = isLigaStart;

  public parseWebsite(dom: DOMParser.Dom): LigaStart {
    const parser = new HtmlNodeParser(dom);
    const teams = parser.byClassAt('emblemdiv', 0).children.flatMap(node => {
      const logoId = getImageId(node.childAt(1).childAt(0).attribute('src'));
      const teamParameters = getTeamParameters(node.childAt(1).attribute('href'));
      if (logoId === undefined && teamParameters === undefined) {
        return [];
      }
      return {
        logoId,
        teamParameters,
      };
    });
    return {
      teams: teams,
    };
  }
}
