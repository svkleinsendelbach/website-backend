import { XmlDocument } from 'fsp-xml-parser';

import { WebserviceFetcher } from '../../Fetchers/WebserviceFetcher';
import { XmlNodeParser } from '../../NodeParser/XmlNodeParser';
import { PersonParameters } from '../../Parameters/PersonParameters';
import { isPersonParameters } from '../../Parameters/PersonParameters.guard';
import { DateOffset, DEFAULT_DATE_OFFSET } from '../../utils';
import { PersonArtikel } from './PersonArtikel';
import { isPersonArtikel } from './PersonArtikel.guard';

export class PersonArtikelParser implements WebserviceFetcher.Parser<PersonParameters, PersonArtikel> {
  public parametersGuard: (obj: any) => obj is PersonParameters = isPersonParameters;

  public getUrl(parameters: PersonParameters & { rowVon: number; rowBis: number }): string {
    return `http://www.anpfiff.info/Webservices/WS_Archiv.asmx/GetCMSArchivArtikel?intSKID=${
      parameters.spielkreis
    }&intSaisID=0&intMonat=0&intRubID=0&intPersID=${parameters.personId}&intTmID=0&intVerID=0&intRowVon=${
      parameters.rowVon
    }&intRowBis=${parameters.rowBis + 1}`;
  }

  public readonly dateOffset: DateOffset = DEFAULT_DATE_OFFSET;

  public interfaceGuard: (obj: any) => obj is PersonArtikel = isPersonArtikel;

  public parseWebservice(dom: XmlDocument): PersonArtikel[] | undefined {
    const parser = new XmlNodeParser(dom.root);
    return parser.children.map(node => {
      return {
        id: node.getIntContent('CMSBtrID'),
        date: node.getContent('CMSBtrFreigabeAb'),
        header: node.getContent('CMSBtrHeader'),
        subHeader: node.getContent('CMSBtrSubHeader'),
        text: node.getContent('CMSBtrTeaser'),
        autor: node.getContent('Autor'),
        rubrik: node.getContent('RubNameSh'),
        imageId: node.getIntContent('CMSBtrTeaserImgBildID'),
      };
    });
  }
}
