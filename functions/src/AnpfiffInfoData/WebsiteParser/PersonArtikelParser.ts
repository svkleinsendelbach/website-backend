import { WebserviceFetcher } from "../WebserviceFetcher";
import { isPersonArtikel } from "../InterfaceGuards/PersonArtikel.guard";
import { PersonInfoParameters } from "../Interfaces/Parameters";
import { PersonArtikel } from "../Interfaces/PersonArtikel";
import { DateOffset } from "../utils";
import { XmlDocument } from "fsp-xml-parser";
import { XmlNodeParser } from "../XmlNodeParser";
import { isPersonInfoParameters } from "../InterfaceGuards/Parameters.guard";

export class PersonArtikelParser
  implements WebserviceFetcher.Parser<PersonInfoParameters, PersonArtikel>
{
  public parametersGuard: (obj: any) => obj is PersonInfoParameters =
    isPersonInfoParameters;

  public getUrl(
    parameters: PersonInfoParameters & { rowVon: number; rowBis: number }
  ): string {
    return `http://www.anpfiff.info/Webservices/WS_Archiv.asmx/GetCMSArchivArtikel?intSKID=${
      parameters.spielkreis
    }&intSaisID=0&intMonat=0&intRubID=0&intPersID=${
      parameters.personId
    }&intTmID=0&intVerID=0&intRowVon=${parameters.rowVon}&intRowBis=${
      parameters.rowBis + 1
    }`;
  }

  public readonly dateOffset: DateOffset = { day: 1 };

  public interfaceGuard: (obj: any) => obj is PersonArtikel = isPersonArtikel;

  public parseWebservice(
    dom: XmlDocument,
    _dirUrl: string
  ): PersonArtikel[] | undefined {
    const parser = new XmlNodeParser(dom.root);
    return parser.children.map((node) => {
      return {
        id: node.getIntContent("CMSBtrID"),
        date: node.getContent("CMSBtrFreigabeAb"),
        header: node.getContent("CMSBtrHeader"),
        subHeader: node.getContent("CMSBtrSubHeader"),
        text: node.getContent("CMSBtrTeaser"),
        autor: node.getContent("Autor"),
        rubrik: node.getContent("RubNameSh"),
        imageId: node.getIntContent("CMSBtrTeaserImgBildID"),
      };
    });
  }
}
