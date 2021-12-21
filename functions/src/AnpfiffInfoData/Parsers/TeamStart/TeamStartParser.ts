import DOMParser from 'dom-parser';

import { WebsiteFetcher } from '../../Fetchers/WebsiteFetcher';
import { HtmlNodeParser } from '../../NodeParser/HtmlNodeParser';
import { getLigaParameters } from '../../Parameters/LigaParameters';
import { getImageId } from '../../Parameters/Parameters';
import { getPersonParameters } from '../../Parameters/PersonParameters';
import { getResultParameters } from '../../Parameters/ResultParameters';
import { getTeamParameters, TeamParameters } from '../../Parameters/TeamParameters';
import { isTeamParameters } from '../../Parameters/TeamParameters.guard';
import { DateOffset, DEFAULT_DATE_OFFSET, regexGroup, toInt } from '../../utils';
import { TeamStart } from './TeamStart';
import { isTeamStart } from './TeamStart.guard';

export class TeamStartParser implements WebsiteFetcher.Parser<TeamParameters, TeamStart> {
  public parametersGuard: (obj: any) => obj is TeamParameters = isTeamParameters;

  public getUrl(parameters: TeamParameters): string {
    return `http://www.anpfiff.info/sites/team/start.aspx?SK=${parameters.spielkreis}&Lg=${parameters.ligaId}&Tm=${parameters.teamId}&Ver=${parameters.vereinId}&Sais=${parameters.saisonId}&Men=${parameters.men}`;
  }

  public readonly dateOffset: DateOffset = DEFAULT_DATE_OFFSET;

  public interfaceGuard: (obj: any) => obj is TeamStart = isTeamStart;

  public parseWebsite(dom: DOMParser.Dom): TeamStart {
    const parser = new HtmlNodeParser(dom);
    const logoId = getImageId(parser.byId('ctl00_cph_modTeamseiteHeader_imgEmblem').attribute('src'));
    const name = parser.byId('ctl00_cph_modTeamseiteHeader_lblTeamName').stringValue;
    const ligaName = parser.byId('ctl00_cph_modTeamseiteHeader_hypLnkLiga').stringValue;
    const ligaParameters = getLigaParameters(parser.byId('ctl00_cph_modTeamseiteHeader_hypLnkLiga').attribute('href'));
    const currentPlacement = parser
      .byId('ctl00_cph__ctrl_0_divTabelle')
      .byClassAt('div-snp', 0)
      .children.slice(1)
      .map(node => {
        return {
          placement: node.byClassAt('f1_Platz', 0).intValue,
          logoId: getImageId(node.byClassAt('f1_Emblem', 0).childAt(0).attribute('src')),
          teamName: node.byClassAt('f1_Team', 0).childAt(0).stringValue,
          teamParameters: getTeamParameters(node.byClassAt('f1_Team', 0).childAt(0).attribute('href')),
          totalGoals: node.byClassAt('f1_Sp', 0).intValue,
          goalsScored: toInt(node.byClassAt('f1_Tore', 0).regexGroup(/^(?<goalsScored>\d+):\d+$/, 'goalsScored')),
          goalsGot: toInt(node.byClassAt('f1_Tore', 0).regexGroup(/^\d+:(?<goalsGot>\d+)$/, 'goalsGot')),
          points: node.childAt(5).intValue,
        };
      });
    const topGoalsPlayers = parser.byId('ctl00_cph__ctrl_0_divTore').children.map(n =>
      n.childAt(0).map(node => {
        return {
          imageId: getImageId(node.childAt(0).childAt(0).attribute('src')),
          name: node.childAt(1).childAt(0).childAt(0).stringValue,
          personParameters: getPersonParameters(node.childAt(1).childAt(0).childAt(0).attribute('href')),
          totalGoals: node.childAt(2).childAt(1).intValue,
        };
      }),
    );
    const topAssistsPlayers = parser
      .byId('ctl00_cph__ctrl_0_divVorlagen')
      .byClassAt('div-snp', 0)
      .children.map(node => {
        return {
          imageId: getImageId(node.childAt(0).childAt(0).attribute('src')),
          name: node.childAt(1).childAt(0).stringValue,
          personParameters: getPersonParameters(node.childAt(1).childAt(0).attribute('href')),
          totalAssists: node.childAt(2).childAt(1).intValue,
        };
      });
    const lastGames = parser
      .byId('ctl00_cph__ctrl_0_divSpieleLast')
      .byClassAt('div-snp', 0)
      .children.map(node => {
        return {
          date: node.childAt(0).stringValue,
          homeTeam: node.childAt(1).regexGroup(/^(?<team>\S+)\s+-\s+\S+$/g, 'team'),
          awayTeam: node.childAt(1).regexGroup(/^\S+\s+-\s+(?<team>\S+)$/g, 'team'),
          goalsHomeTeam: toInt(
            node
              .childAt(2)
              .childAt(0)
              .regexGroup(/^(?<goalsScored>\d+):\d+$/, 'goalsScored'),
          ),
          goalsAwayTeam: toInt(
            node
              .childAt(2)
              .childAt(0)
              .regexGroup(/^\d+:(?<goalsGot>\d+)$/, 'goalsGot'),
          ),
          resultParamters: getResultParameters(node.childAt(2).childAt(0).attribute('href')),
        };
      });
    const nextGames = parser
      .byId('ctl00_cph__ctrl_0_divSpieleNext5')
      .children.slice(0, -1)
      .map(n =>
        n.childAt(0).map(node => {
          const rawHomeAway = node.childAt(1).childAt(1).childAt(0).textContent?.[0];
          return {
            logoId: getImageId(node.childAt(0).childAt(0).attribute('src')),
            date: node.childAt(1).childAt(0).stringValue,
            opponentName: node.childAt(1).childAt(1).childAt(1).stringValue,
            oppenentParameters: getTeamParameters(node.childAt(1).childAt(1).childAt(1).attribute('href')),
            homeAway: (rawHomeAway == 'H' || rawHomeAway == 'A' ? rawHomeAway : undefined) as 'H' | 'A' | undefined,
            currentPlacement: toInt(
              regexGroup(
                node.childAt(1).childAt(1).childAt(2).textContent,
                /^\s*\((?<placement>\d+)\.\)\s*$/g,
                'placement',
              ),
            ),
          };
        }),
      );
    const properties = parser
      .byId('ctl00_cph__ctrl_0_divZahlen')
      .byClassAt('div-snp', 0)
      .byClassAt('row-snp', 0)
      .map(node => {
        return {
          totalGames: node.childAt(0).childAt(0).childAt(2).childAt(0).intValue,
          gamesWon: node.childAt(1).childAt(0).childAt(2).childAt(0).intValue,
          gamesDraw: node.childAt(2).childAt(0).childAt(2).childAt(0).intValue,
          gamesLost: node.childAt(3).childAt(0).childAt(2).childAt(0).intValue,
          gamesToZero: node.childAt(4).childAt(0).childAt(2).childAt(0).intValue,
          gamesWithoutGoalsShot: node.childAt(5).childAt(0).childAt(2).childAt(0).intValue,
          totalGoals: node.childAt(6).childAt(0).childAt(2).childAt(0).intValue,
          numberDiffernetScorer: node.childAt(7).childAt(0).childAt(2).childAt(0).intValue,
          ownGoals: node.childAt(8).childAt(0).childAt(2).childAt(0).intValue,
          penaltyGoals: node.childAt(9).childAt(0).childAt(2).childAt(0).intValue,
          totalYellowCards: node.childAt(10).childAt(0).childAt(2).childAt(0).intValue,
          totalYellowRedCards: node.childAt(11).childAt(0).childAt(2).childAt(0).intValue,
          totalRedCards: node.childAt(12).childAt(0).childAt(2).childAt(0).intValue,
          totalPlayers: node.childAt(13).childAt(0).childAt(2).childAt(0).intValue,
          spectetors: node.childAt(14).childAt(0).childAt(2).childAt(0).intValue,
          averageSpectators: node.childAt(15).childAt(0).childAt(2).childAt(0).intValue,
        };
      });
    return {
      logoId: logoId,
      name: name,
      ligaName: ligaName,
      ligaParameters: ligaParameters,
      currentPlacement: currentPlacement,
      topGoalsPlayers: topGoalsPlayers,
      topAssistsPlayers: topAssistsPlayers,
      lastGames: lastGames,
      nextGames: nextGames,
      properties: properties,
    };
  }
}
