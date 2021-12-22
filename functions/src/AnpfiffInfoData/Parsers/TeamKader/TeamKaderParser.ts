import DOMParser from 'dom-parser';

import { WebsiteFetcher } from '../../Fetchers/WebsiteFetcher';
import { HtmlNodeParser } from '../../NodeParser/HtmlNodeParser';
import { getImageId } from '../../Parameters/Parameters';
import { getPersonParameters } from '../../Parameters/PersonParameters';
import { TeamParameters } from '../../Parameters/TeamParameters';
import { isTeamParameters } from '../../Parameters/TeamParameters.guard';
import { DateOffset, DEFAULT_DATE_OFFSET, toInt } from '../../utils';
import { TeamKader, TeamKaderPerson } from './TeamKader';
import { isTeamKader } from './TeamKader.guard';

export class TeamKaderParser implements WebsiteFetcher.Parser<TeamParameters, TeamKader> {
  public parametersGuard: (obj: any) => obj is TeamParameters = isTeamParameters;

  public getUrl(parameters: TeamParameters): string {
    return `http://www.anpfiff.info/sites/team/kader.aspx?SK=${parameters.spielkreis}&Lg=${parameters.ligaId}&Tm=${parameters.teamId}&Ver=${parameters.vereinId}&Sais=${parameters.saisonId}&Men=${parameters.men}`;
  }

  public readonly dateOffset: DateOffset = DEFAULT_DATE_OFFSET;

  public interfaceGuard: (obj: any) => obj is TeamKader = isTeamKader;

  public parseWebsite(dom: DOMParser.Dom): TeamKader {
    const parser = new HtmlNodeParser(dom);
    let currentPosition: 'torwart' | 'abwehr' | 'mittelfeld' | 'sturm' | 'ohneAngabe' | undefined = undefined;
    const kader: {
      torwart: TeamKaderPerson[];
      abwehr: TeamKaderPerson[];
      mittelfeld: TeamKaderPerson[];
      sturm: TeamKaderPerson[];
      ohneAngabe: TeamKaderPerson[];
    } = {
      torwart: [],
      abwehr: [],
      mittelfeld: [],
      sturm: [],
      ohneAngabe: [],
    };
    parser
      .byId('ctl00_cph__ctrl_4_divSpielerkader')
      .childAt(1)
      .children.forEach(node => {
        const position = node.childAt(3).childAt(1).childAt(1).childAt(0).stringValue;
        switch (position) {
          case 'Torwart':
            currentPosition = 'torwart';
            return;
          case 'Abwehr':
            currentPosition = 'abwehr';
            return;
          case 'Mittelfeld':
            currentPosition = 'mittelfeld';
            return;
          case 'Sturm':
            currentPosition = 'sturm';
            return;
          case 'ohne Positionsangabe':
            currentPosition = 'ohneAngabe';
            return;
        }
        const imageId = getImageId(node.childAt(1).childAt(1).childAt(0).attribute('src'));
        const firstName = node.childAt(3).childAt(1).childAt(2).textContent;
        const lastName = node.childAt(3).childAt(1).childAt(0).textContent;
        const personParameters = getPersonParameters(node.childAt(3).childAt(1).attribute('href'));
        const age = toInt(
          node
            .childAt(5)
            .childAt(1)
            .regexGroup(/^\((?<age>\d+)\)$/g, 'age'),
        );
        const inSquad = toInt(
          node
            .childAt(7)
            .childAt(1)
            .regexGroup(/^(?<n>\d+)[\s\S]*$/g, 'n'),
        );
        const goals = toInt(
          node
            .childAt(7)
            .childAt(3)
            .regexGroup(/^(?<n>\d+)[\s\S]*$/g, 'n'),
        );
        const assists = node.childAt(7).childAt(5).intValue;
        if (
          (firstName === undefined || /^\s*$/g.exec(firstName) !== null) &&
          (lastName === undefined || /^\s*$/g.exec(lastName) !== null)
        ) {
          return;
        }
        kader[currentPosition ?? 'ohneAngabe'].push({
          imageId: imageId,
          firstName: firstName,
          lastName: lastName,
          personParameters: personParameters,
          age: age,
          inSquad: inSquad,
          goals: goals,
          assists: assists,
        });
      });
    const coach = parser
      .byId('ctl00_cph__ctrl_5_divTrainer')
      .childAt(1)
      .childAt(1)
      .map(node => {
        return {
          imageId: getImageId(node.childAt(1).childAt(1).attribute('src')),
          name: node.childAt(3).childAt(1).childAt(0).stringValue,
          personParameters: getPersonParameters(node.childAt(3).childAt(1).attribute('href')),
          age: toInt(
            node
              .childAt(3)
              .childAt(3)
              .regexGroup(/^\s*\((?<age>\d+)\)\s*$/g, 'age'),
          ),
        };
      });
    const stab = parser.byId('ctl00_cph__ctrl_6_divMitarbeiter').children.flatMap(node => {
      const _function = node.childAt(3).childAt(1).childAt(1).stringValue;
      const name = node.childAt(3).childAt(3).childAt(1).childAt(0).stringValue;
      if (
        (_function === undefined || /^\s*$/g.exec(_function) !== null) &&
        (name === undefined || /^\s*$/g.exec(name) !== null)
      ) {
        return [];
      }
      return {
        imageId: getImageId(node.childAt(1).childAt(1).attribute('src')),
        function: _function,
        name: name,
        personParameters: getPersonParameters(node.childAt(3).childAt(3).childAt(1).attribute('href')),
      };
    });
    return {
      kader: kader,
      coach: coach,
      stab: stab,
    };
  }
}
