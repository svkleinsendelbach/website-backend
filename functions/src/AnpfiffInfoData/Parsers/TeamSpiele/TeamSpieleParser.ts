import DOMParser from 'dom-parser';

import { throwsAsUndefined } from '../../../utils';
import { FullDatum } from '../../../utils/FullDatum';
import { WebsiteFetcher } from '../../Fetchers/WebsiteFetcher';
import { HtmlNodeParser } from '../../NodeParser/HtmlNodeParser';
import { getImageId } from '../../Parameters/Parameters';
import { getResultParameters } from '../../Parameters/ResultParameters';
import { TeamParameters } from '../../Parameters/TeamParameters';
import { isTeamParameters } from '../../Parameters/TeamParameters.guard';
import { DateOffset, DEFAULT_DATE_OFFSET, regexGroup, toInt } from '../../utils';
import { TeamSpiele } from './TeamSpiele';
import { isTeamSpiele } from './TeamSpiele.guard';

export class TeamSpieleParser implements WebsiteFetcher.Parser<TeamParameters, TeamSpiele> {
  public parametersGuard: (obj: any) => obj is TeamParameters = isTeamParameters;

  public getUrl(parameters: TeamParameters): string {
    return `http://www.anpfiff.info/sites/team/spiele.aspx?SK=${parameters.spielkreis}&Lg=${parameters.ligaId}&Tm=${parameters.teamId}&Ver=${parameters.vereinId}&Sais=${parameters.saisonId}&Men=${parameters.men}`;
  }

  public readonly dateOffset: DateOffset = DEFAULT_DATE_OFFSET;

  public interfaceGuard: (obj: any) => obj is TeamSpiele = isTeamSpiele;

  public parseWebsite(dom: DOMParser.Dom): TeamSpiele {
    const parser = new HtmlNodeParser(dom);
    const properties = parser
      .byId('ctl00_cph__ctrl_0_divZahlen')
      .byClassAt('div-snp', 0)
      .byClassAt('row-snp', 0)
      .getZahlenProperties({
        games: 'Spiele',
        wins: 'Siege gesamt',
        winsHome: 'Heim-Siege',
        winsAway: 'Auswärts-Siege',
        draws: 'Unentschieden',
        losts: 'Niederlagen gesamt',
        lostsHome: 'Heim-Niederlagen',
        lostsAway: 'Auswärts-Niederlagen',
        gamesToZero: 'Zu-Null-Spiele',
        gamesWithoutGoalsShot: 'Spiele ohne eigenen Treffer',
      });
    let currentSpiel: 'spiele' | 'vorbereitungsSpiele' = 'spiele';
    const teamSpiele: TeamSpiele = {
      spiele: [],
      vorbereitungsSpiele: [],
      properties: properties,
    };
    parser
      .byId('ctl00_cph_modTSSpieleSaison_divSpiele')
      .childAt(1)
      .children.forEach(node => {
        const spiel = node.childAt(1).childAt(0).stringValue;
        if (spiel?.includes('Vorbereitungsspiele')) {
          currentSpiel = 'vorbereitungsSpiele';
        }
        const date = throwsAsUndefined(() => FullDatum.fromValue(node.childAt(3).childAt(1).stringValue));
        const logoId = getImageId(node.childAt(5).childAt(1).attribute('src'));
        const homeAway = node.childAt(7).childAt(1).stringValue;
        const opponent = node.childAt(9).childAt(1).stringValue;
        const result = node.childAt(11).childAt(1).stringValue;
        const homeResult = toInt(regexGroup(result, /\s*(?<home>\d+):\d+\s*/, 'home'));
        const awayResult = toInt(regexGroup(result, /\s*\d+:(?<away>\d+)\s*/, 'away'));
        const resultParameters = getResultParameters(node.childAt(11).childAt(1).attribute('href'));
        const sonderwertung = node.childAt(13).childAt(1).stringValue;
        if (opponent === undefined) {
          return;
        }
        teamSpiele[currentSpiel]?.push({
          date,
          logoId,
          homeAway: (['A', 'H', undefined].includes(homeAway) ? homeAway : undefined) as 'A' | 'H' | undefined,
          opponent,
          result:
            homeResult === undefined || awayResult == undefined
              ? undefined
              : {
                  homeTeam: homeResult,
                  awayTeam: awayResult,
                },
          resultParameters,
          sonderwertung: /^\s*$/g.exec(sonderwertung ?? '') == null,
        });
      });
    return teamSpiele;
  }
}
