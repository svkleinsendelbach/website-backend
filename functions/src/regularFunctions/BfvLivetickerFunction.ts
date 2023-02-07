import { AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { DatabaseType } from '../classes/DatabaseType';
import { FiatShamirParameters } from '../classes/FiatShamirParameters';
import { FirebaseFunction } from '../utils/FirebaseFunction';
import { Logger } from '../utils/Logger';
import { ParameterContainer } from '../utils/Parameter/ParameterContainer';
import { ParameterParser } from '../utils/Parameter/ParameterParser';
import { ParameterBuilder } from '../utils/Parameter/ParameterBuilder';
import { BfvApiLiveticker, BfvLiveticker } from '../classes/BfvLiveticker';
import { HtmlDom } from '../WebsiteExtractor/HtmlNode';
import DOMParser from 'dom-parser';
import { ensureNotNullable, httpsError } from '../utils/utils';
import fetch from 'cross-fetch';

export class BfvLivetickerFunction implements FirebaseFunction<
    BfvLivetickerFunction.Parameters,
    BfvLivetickerFunction.ReturnType
> {

    public parameters: BfvLivetickerFunction.Parameters;

    private logger: Logger;

    public constructor(data: any, auth: AuthData | undefined) {
        this.logger = Logger.start(data.verbose, 'BfvLivetickerFunction.constructor', { data, auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, this.logger.nextIndent);
        const parameterParser = new ParameterParser<BfvLivetickerFunction.Parameters>(
            {
                fiatShamirParameters: ParameterBuilder.builder('object', FiatShamirParameters.fromObject),
                databaseType: ParameterBuilder.builder('string', DatabaseType.fromString),
                gameId: ParameterBuilder.trivialBuilder('string')
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<BfvLivetickerFunction.ReturnType> {
        this.logger.log('BfvLivetickerFunction.executeFunction', {}, 'info');
        // TODO await checkPrerequirements(this.parameters, this.logger.nextIndent, 'notRequired');

        const gameInfo = await this.fetchGameInfoFromGamePage(this.parameters.gameId);
        const livetickerIds = await this.fetchLivetickerIdsFromGamePage(this.parameters.gameId);
        const livetickers = await Promise.all(livetickerIds.map(async livetickerId => {
            const url = `https://apiwrapper.bfv.de/spiel/${this.parameters.gameId}/ticker/${livetickerId}`;
            const ticker: BfvApiLiveticker = await (await fetch(url)).json();
            return {
                id: livetickerId,
                ...BfvLiveticker.mapBfvLiveticker(ticker, gameInfo.homeTeam.imageId)
            };
        }));
        return {
            ...gameInfo,
            livetickers: livetickers
        };
    }

    private async fetchGameInfoFromGamePage(gameId: string): Promise<Omit<BfvLivetickerFunction.ReturnType, 'livetickers'>> {
        const url = `https://www.bfv.de/spiele/${gameId}`;
        const html = await (await fetch(url)).text();
        const dom = new HtmlDom(new DOMParser().parseFromString(html));
        const node = dom.nodesByClass('bfv-matchdata-stage').at(0).nthChild(1).nthChild(1);
        const homeTeamId = node.nthChild(5).nthChild(1).nthChild(3).nodesByClass('bfv-matchdata-result__team--team0').at(0).nodesByClass('bfv-matchdata-result__team-link').at(0).attribute('href').regexGroup(/^https:\/\/www\.bfv\.de\/mannschaften(?:\/\S+?)?\/(?<id>\S+?)$/g, 'id').toString();
        const awayTeamId = node.nthChild(5).nthChild(1).nthChild(3).nodesByClass('bfv-matchdata-result__team--team1').at(0).nodesByClass('bfv-matchdata-result__team-link').at(0).attribute('href').regexGroup(/^https:\/\/www\.bfv\.de\/mannschaften(?:\/\S+?)?\/(?<id>\S+?)$/g, 'id').toString();
        if (homeTeamId === null || awayTeamId === null)
            throw httpsError('not-found', 'Couldn\'t get ids for home and away team.', this.logger);
        const homeImageId = node.nthChild(5).nthChild(1).nthChild(3).nodesByClass('bfv-matchdata-result__team--team0').at(0).nodesByClass('bfv-matchdata-result__team-icon').at(0).nodesByTag('img').at(0).attribute('src').regexGroup(/^\/\/service-prod\.bfv\.de\/export\.media\?action=getLogo&format=7&id=(?<id>\S+?)$/g, 'id').toString();
        const awayImageId = node.nthChild(5).nthChild(1).nthChild(3).nodesByClass('bfv-matchdata-result__team--team1').at(0).nodesByClass('bfv-matchdata-result__team-icon').at(0).nodesByTag('img').at(0).attribute('src').regexGroup(/^\/\/service-prod\.bfv\.de\/export\.media\?action=getLogo&format=7&id=(?<id>\S+?)$/g, 'id').toString();
        if (homeImageId === null || awayImageId === null)
            throw httpsError('not-found', 'Couldn\'t get ids for home and away team images.', this.logger);
        const dateValue = node.nthChild(3).nthChild(5).nthChild(3).value;
        const date1 = dateValue.regexGroup(/^\s*(?<date>\d{2})\.\d{2}\.\d{4}\s+\/\d{2}:\d{2} Uhr\s*$/g, 'date').toInt();
        const date2 = dateValue.regexGroup(/^\s*\d{2}\.(?<date>\d{2})\.\d{4}\s+\/\d{2}:\d{2} Uhr\s*$/g, 'date').toInt();
        const date3 = dateValue.regexGroup(/^\s*\d{2}\.\d{2}\.(?<date>\d{4})\s+\/\d{2}:\d{2} Uhr\s*$/g, 'date').toInt();
        const date4 = dateValue.regexGroup(/^\s*\d{2}\.\d{2}\.\d{4}\s+\/(?<time>\d{2}:\d{2}) Uhr\s*$/g, 'time').toString();
        const date = date1 === null || date2 === null || date3 === null || date4 === null ? null : `${date3}-${date2}-${date1}T${date4}:00.000Z`;
        const adressValue = dom.nodesByClass('bfv-game-info').at(0).nthChild(1).nthChild(1).nthChild(1).nthChild(1).nthChild(3).value;
        const adress1 = adressValue.regexGroup(/^[\S\s]+?\|(?<street>[\S\s]+?)\|[\S\s]+?$/g, 'street').toString();
        const adress2 = adressValue.regexGroup(/^[\S\s]+?\|[\S\s]+?\|(?<city>[\S\s]+?)$/g, 'city').toString();
        const adress = adress1 === null || adress2 === null ? null : `${adress1}, ${adress2}`;
        const title = dom.nodesByTag('head').at(0).nodesByTag('title').at(0).value;
        return ensureNotNullable<Omit<BfvLivetickerFunction.ReturnType, 'livetickers'>>({
            id: gameId,
            competition: {
                name: node.nthChild(3).nthChild(1).nthChild(1).value.toString(),
                link: node.nthChild(3).nthChild(1).attribute('href').toString(),
                gameDay: node.nthChild(3).nthChild(3).value.regexGroup(/^(?<day>\d+?)\. Spieltag$/g, 'day').toInt()
            },
            result: await this.fetchResultFromPartialGamePage(gameId),
            date: date,
            homeTeam: {
                name: title.regexGroup(/^Spiel (?<name>[\S\s]+?) gegen [\S\s]+?&nbsp;\| BFV$/g, 'name').toString(),
                id: homeTeamId,
                imageId: homeImageId
            },
            awayTeam: {
                name: title.regexGroup(/^Spiel [\S\s]+? gegen (?<name>[\S\s]+?)&nbsp;\| BFV$/g, 'name').toString(),
                id: awayTeamId,
                imageId: awayImageId
            },
            adress: adress ?? undefined,
            adressDescription: adressValue.regexGroup(/^(?<description>[\S\s]+?)\|[\S\s]+?\|[\S\s]+?$/g, 'description').toString() ?? undefined
        });
    }

    private async fetchResultFromPartialGamePage(gameId: string): Promise<Record<'home' | 'away', number>> {
        const url = `https://www.bfv.de/partial/spieldetail/liveticker/ergebnis-buehne/${gameId}`;
        const html = await (await fetch(url)).text();
        const dom = new HtmlDom(new DOMParser().parseFromString(html));
        return {
            home: this.mapResult(dom.nodesByClass('bfv-matchdata-result__goals-wrapper').at(0).nthChild(1).value.toString()),
            away: this.mapResult(dom.nodesByClass('bfv-matchdata-result__goals-wrapper').at(0).nthChild(5).value.toString())
        };
    }

    private mapResult(result: string | null): number {
        if (result === null) 
            return 0;
        const numberMap: Record<string, number> = {
            '56': 0, '57': 0, '6F': 0, '79': 0, '7B': 0, '89': 0, '8D': 0, 'A0': 0, 'A4': 0, 'B9': 0,
            '53': 1, '62': 1, '68': 1, '76': 1, '80': 1, '8A': 1, '90': 1, '9D': 1, 'A3': 1, 'AA': 1,
            '54': 2, '55': 2, '5C': 2, '84': 2, '8B': 2, '96': 2, 'B0': 2, 'B6': 2, 'B8': 2, 'BC': 2,
            '50': 3, '5E': 3, '5F': 3, '60': 3, '72': 3, '73': 3, '74': 3, '82': 3, '87': 3, '9A': 3,
            '61': 4, '85': 4, '8C': 4, '91': 4, '98': 4, 'A6': 4, 'AC': 4, 'AE': 4, 'B3': 4, 'BB': 4,
            '5A': 5, '6B': 5, '7E': 5, '88': 5, '8F': 5, 'A8': 5, 'A9': 5, 'B1': 5, 'B4': 5, 'BA': 5,
            '59': 6, '5D': 6, '78': 6, '7D': 6, '9E': 6, '9F': 6, 'A1': 6, 'A5': 6, 'AF': 6, 'BD': 6,
            '58': 7, '5B': 7, '6A': 7, '77': 7, '7C': 7, '94': 7, '97': 7, '9C': 7, 'AD': 7, 'B5': 7,
            '52': 8, '63': 8, '65': 8, '66': 8, '6E': 8, '75': 8, '83': 8, '92': 8, '93': 8, 'AB': 8,
            '51': 9, '67': 9, '71': 9, '7A': 9, '7F': 9, '81': 9, '99': 9, '9B': 9, 'B2': 9, 'B7': 9
        };
        
        let r = '';
        const regex = /&#xE6(?<n>[0-9A-F]{2});/gm;
        let match;
        while ((match = regex.exec(result)) !== null) {
            if (match.index === regex.lastIndex)
                regex.lastIndex++;
            if (match.groups!.n in numberMap)
                r += numberMap[match.groups!.n].toString();
        }
        
        return Number.isNaN(Number.parseInt(r)) ? 0 : Number.parseInt(r);
    }
    
    private async fetchLivetickerIdsFromGamePage(gameId: string): Promise<string[]> {
        const url = `https://www.bfv.de/partial/spieldetail/liveticker/${gameId}`;
        const html = await (await fetch(url)).text();
        const dom = new HtmlDom(new DOMParser().parseFromString(html));
        const node = dom.nodesByClass('bfv-liveticker').at(0).nthChild(1).nthChild(1).nthChild(1).nthChild(1).nthChild(1).nthChild(1);
        const livetickerIds: string[] = [];
        for (const attribute of node.attributes ?? []) {
            if (attribute.name === 'value')
                livetickerIds.push(attribute.value);
        }
        for (const attribute of node.nthChild(1).attributes ?? []) {
            if (attribute.name === 'value')
                livetickerIds.push(attribute.value);
        }
        return livetickerIds;
    }
}

export namespace BfvLivetickerFunction {
    export type Parameters = FirebaseFunction.DefaultParameters & {
        gameId: string;
    }

    export type ReturnType = {
        id: string;
        competition: {
            name: string;
            link: string;
            gameDay: number;
        };
        result: {
            home: number;
            away: number;
        }
        date: string;
        homeTeam: ReturnType.Team;
        awayTeam: ReturnType.Team;
        adress: string | undefined;
        adressDescription: string | undefined;
        livetickers: ({ 
            id: string;
         } & BfvLiveticker)[];
    };

    export namespace ReturnType {
        export type Team = {
            id: string;
            name: string;
            imageId: string;
        }
    }

    export type CallParameters = {
        gameId: string;
    }
}
