import { WebserviceFetcher } from "../WebserviceFetcher";
import { isPersonBilder } from "../InterfaceGuards/PersonBilder.guard";
import { PersonInfoParameters } from "../Interfaces/Parameters";
import { DateOffset } from "../utils";
import { XmlDocument } from "fsp-xml-parser";
import { XmlNodeParser } from "../XmlNodeParser";
import { isPersonInfoParameters } from "../InterfaceGuards/Parameters.guard";
import { PersonBilder } from "../Interfaces/PersonBilder";

export class PersonBilderParser
  implements WebserviceFetcher.Parser<PersonInfoParameters, PersonBilder>
{
  public parametersGuard: (obj: any) => obj is PersonInfoParameters =
    isPersonInfoParameters;

  public getUrl(
    parameters: PersonInfoParameters & { rowVon: number; rowBis: number }
  ): string {
    return `http://www.anpfiff.info/Webservices/WS_Archiv.asmx/GetBilder?intSKID=${
      parameters.spielkreis
    }&intSaisID=0&intMonat=0&intRubID=0&intPersID=${
      parameters.personId
    }&intTmID=0&intVerID=0&intRowVon=${parameters.rowVon}&intRowBis=${
      parameters.rowBis + 1
    }`;
  }

  public readonly dateOffset: DateOffset = { day: 1 };

  public interfaceGuard: (obj: any) => obj is PersonBilder = isPersonBilder;

  public parseWebservice(dom: XmlDocument): PersonBilder[] | undefined {
    const parser = new XmlNodeParser(dom.root);
    const images: PersonBilder[] = [];
    for (const node of parser.children) {
      const streckenId = node.getIntContent("BildSID");
      if (streckenId == undefined) {
        continue;
      }
      const bild = {
        id: node.getIntContent("BildID"),
        index: node.getIntContent("BildSFRF"),
      };
      const image = images.find((image) => image.streckenId == streckenId);
      if (image != undefined) {
        if (image.bilder == undefined) {
          image.bilder = [bild];
        } else {
          image.bilder.push(bild);
        }
      } else {
        images.push({
          streckenId: streckenId,
          streckenName: node.getContent("BildSName"),
          bilder: [bild],
        });
      }
    }
    return images;
  }
}
