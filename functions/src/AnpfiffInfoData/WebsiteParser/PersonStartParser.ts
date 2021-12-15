import DOMParser from "dom-parser";
import { PersonStart } from "../Interfaces/PersonStart";
import { HtmlNodeParser } from "../HtmlNodeParser";
import { WebsiteFetcher } from "../WebsiteFetcher";
import { absPath, DateOffset } from "../utils";
import { isPersonStart } from "../InterfaceGuards/PersonStart.guard";
import {
  getTeamInfoParameters,
  PersonInfoParameters,
} from "../Interfaces/Parameters";
import { isPersonInfoParameters } from "../InterfaceGuards/Parameters.guard";

export class PersonStartParser
  implements WebsiteFetcher.Parser<PersonInfoParameters, PersonStart>
{
  public parametersGuard: (obj: any) => obj is PersonInfoParameters =
    isPersonInfoParameters;

  public getUrl(parameters: PersonInfoParameters): string {
    return `http://www.anpfiff.info/sites/person/start.aspx?SK=${parameters.spielkreis}&Pers=${parameters.personId}`;
  }

  public readonly dateOffset: DateOffset = { day: 1 };

  public interfaceGuard: (obj: any) => obj is PersonStart = isPersonStart;

  public parseWebsite(dom: DOMParser.Dom, dirUrl: string): PersonStart {
    const parser = new HtmlNodeParser(dom);
    const imageUrl = absPath(
      dirUrl,
      parser.byId("ctl00_cphO__ctrl_1_imgPerson").attribute("src")
    );
    const name = parser.byId("ctl00_cphO__ctrl_1_lblName").stringValue;
    const properties: { [key: string]: any | undefined } = {};
    parser
      .byId("ctl00_cphR__ctrl_3_divSteckbriefIH")
      .byClassAt("div-snp", 0)
      .children.forEach((node) => {
        switch (node.childAt(0).textContent) {
          case "Alter":
            properties.age = node.childAt(1).numberValue;
            break;
          case "Nation":
            properties.nationFlagUrl = absPath(
              dirUrl,
              node.childAt(1).childAt(0).childAt(0).attribute("src")
            );
            properties.nation = node.childAt(1).childAt(1).stringValue;
            break;
          case "Starker Fuß":
            properties.strongFoot = node.childAt(1).stringValue;
            break;
          case "Lieb.-Position":
            properties.favoritePosition = node.childAt(1).stringValue;
            break;
        }
      });
    const carrier = {
      totalGames: parser
        .byId("ctl00_cphR__ctrl_3_divSpielerKarriereIH")
        .byClassAt("row-snp", 0)
        .childAt(0)
        .childAt(0)
        .childAt(2)
        .childAt(0).intValue,
      gamesWon: parser
        .byId("ctl00_cphR__ctrl_3_divSpielerKarriereIH")
        .byClassAt("row-snp", 0)
        .childAt(1)
        .childAt(0)
        .childAt(2)
        .childAt(0).intValue,
      gamesDraw: parser
        .byId("ctl00_cphR__ctrl_3_divSpielerKarriereIH")
        .byClassAt("row-snp", 0)
        .childAt(2)
        .childAt(0)
        .childAt(2)
        .childAt(0).intValue,
      gamesLost: parser
        .byId("ctl00_cphR__ctrl_3_divSpielerKarriereIH")
        .byClassAt("row-snp", 0)
        .childAt(3)
        .childAt(0)
        .childAt(2)
        .childAt(0).intValue,
      totalGoals: parser
        .byId("ctl00_cphR__ctrl_3_divSpielerKarriereIH")
        .byClassAt("row-snp", 0)
        .childAt(4)
        .childAt(0)
        .childAt(2)
        .childAt(0).intValue,
      totalTeams: parser
        .byId("ctl00_cphR__ctrl_3_divSpielerKarriereIH")
        .byClassAt("row-snp", 0)
        .childAt(5)
        .childAt(0)
        .childAt(2)
        .childAt(0).intValue,
      totalAscents: parser
        .byId("ctl00_cphR__ctrl_3_divSpielerKarriereIH")
        .byClassAt("row-snp", 0)
        .childAt(6)
        .childAt(0)
        .childAt(2)
        .childAt(0).intValue,
      totalDescents: parser
        .byId("ctl00_cphR__ctrl_3_divSpielerKarriereIH")
        .byClassAt("row-snp", 0)
        .childAt(7)
        .childAt(0)
        .childAt(2)
        .childAt(0).intValue,
    };
    const playerStations = parser
      .byId("ctl00_cphR__ctrl_3_divSpielerStationenIH")
      .byClassAt("div-snp", 0)
      .children.map((node) => {
        return {
          season: node.childAt(0).stringValue,
          teamIconUrl: absPath(
            dirUrl,
            node.childAt(1).childAt(0).attribute("src")
          ),
          teamName: node.childAt(2).textContent,
          teamParameters: getTeamInfoParameters(
            node.childAt(2).childAt(0).attribute("href")
          ),
          league: node.childAt(3).stringValue,
          ascentDescent: node.childAt(4).childAt(0).attribute("title"),
        };
      });
    const transfers = parser
      .byId("ctl00_cphR__ctrl_3_divSpielerTransfersIH")
      .byClassAt("div-snp", 0)
      .children.map((node) => {
        return {
          date: node.childAt(0).stringValue,
          fromIconUrl: absPath(
            dirUrl,
            node.childAt(1).childAt(0).childAt(1).childAt(0).attribute("src")
          ),
          fromName: node.childAt(1).childAt(0).childAt(2).stringValue,
          toIconUrl: absPath(
            dirUrl,
            node.childAt(1).childAt(1).childAt(1).childAt(0).attribute("src")
          ),
          toName: node.childAt(1).childAt(1).childAt(2).stringValue,
        };
      });
    const seasonResults = parser
      .byId("ctl00_cphR__ctrl_3_divSpielerSaisonbilanzIH")
      .byClassAt("div-snp", 0)
      .children.slice(1, -1)
      .map((node) => {
        return {
          season: node.childAt(0).stringValue,
          teamName: node.childAt(2).childAt(1).stringValue,
          teamParameters: getTeamInfoParameters(
            node.childAt(2).childAt(1).attribute("href")
          ),
          games: node.childAt(3).intValue,
          goals: node.childAt(4).intValue,
          assists: node.childAt(5).intValue,
          substitutionsIn: node.childAt(6).intValue,
          substitutionsOut:
            node.childAt(7).intValue ?? ("R" as number | "R" | undefined),
          yellowRedCards: node.childAt(8).intValue,
          redCards: node.childAt(9).intValue,
        };
      });
    const coachStations = parser
      .byId("ctl00_cphR__ctrl_3_divTrainerStationenIH")
      .byClassAt("div-snp", 0)
      .children.map((node) => {
        return {
          season: node.childAt(0).stringValue,
          teamIconUrl: absPath(
            dirUrl,
            node.childAt(1).childAt(0).attribute("src")
          ),
          teamName: node.childAt(2).textContent,
          teamParameters: getTeamInfoParameters(
            node.childAt(2).childAt(0).attribute("href")
          ),
          league: node.childAt(3).stringValue,
        };
      });
    return {
      imageUrl: imageUrl,
      name: name,
      properties: properties,
      carrier: carrier,
      playerStations: playerStations,
      transfers: transfers,
      seasonResults: seasonResults,
      coachStations: coachStations,
    };
  }
}
