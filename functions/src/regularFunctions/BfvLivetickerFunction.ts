import { AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkPrerequirements } from '../utils/checkPrerequirements';
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
import { ensureNotNullable } from '../utils/utils';
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
        await checkPrerequirements(this.parameters, this.logger.nextIndent, 'notRequired');

        const gameInfo = await this.fetchGameInfoFromGamePage(this.parameters.gameId);
        const livetickerIds = await this.fetchLivetickerIdsFromGamePage(this.parameters.gameId);
        const livetickers = await Promise.all(livetickerIds.map(async livetickerId => {
            const url = `https://apiwrapper.bfv.de/spiel/${this.parameters.gameId}/ticker/${livetickerId}`;
            const ticker: BfvApiLiveticker = await (await fetch(url)).json();
            return {
                ...BfvLiveticker.toBfvLiveticker(ticker),
                id: livetickerId
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
        const date = node.nthChild(3).nthChild(5).nthChild(3).value;
        const date1 = date.regexGroup(/^\s*(?<date>\d{2})\.\d{2}\.\d{4}\s+\/\d{2}:\d{2} Uhr\s*$/g, 'date').toInt();
        const date2 = date.regexGroup(/^\s*\d{2}\.(?<date>\d{2})\.\d{4}\s+\/\d{2}:\d{2} Uhr\s*$/g, 'date').toInt();
        const date3 = date.regexGroup(/^\s*\d{2}\.\d{2}\.(?<date>\d{4})\s+\/\d{2}:\d{2} Uhr\s*$/g, 'date').toInt();
        const date4 = date.regexGroup(/^\s*\d{2}\.\d{2}\.\d{4}\s+\/(?<time>\d{2}:\d{2}) Uhr\s*$/g, 'time').toString();
        if (date1 === null || date2 === null || date3 === null || date4 === null)
            throw new Error('Couldn\'t extract date from webpage.');
        const adress = dom.nodesByClass('bfv-game-info').at(0).nthChild(1).nthChild(1).nthChild(1).nthChild(1).nthChild(3).value;
        const adress1 = adress.regexGroup(/^[\S\s]+?\|(?<street>[\S\s]+?)\|[\S\s]+?$/g, 'street').toString();
        const adress2 = adress.regexGroup(/^[\S\s]+?\|[\S\s]+?\|(?<city>[\S\s]+?)$/g, 'city').toString();
        if (adress1 === null || adress2 === null)
            throw new Error('Couldn\'t extract adress from webpage.');
        return ensureNotNullable<Omit<BfvLivetickerFunction.ReturnType, 'livetickers'>>({
            id: gameId,
            competition: {
                name: node.nthChild(3).nthChild(1).nthChild(1).value.toString(),
                link: node.nthChild(3).nthChild(1).attribute('href').toString(),
                gameDay: node.nthChild(3).nthChild(3).value.regexGroup(/^(?<day>\d+?)\. Spieltag$/g, 'day').toInt()
            },
            date: `${date3}-${date2}-${date1}T${date4}:00.000Z`,
            homeTeam: {
                name: node.nthChild(5).nthChild(1).nthChild(3).nodesByClass('bfv-matchdata-result__team--team0').at(0).nodesByClass('bfv-matchdata-result__team-icon').at(0).nodesByTag('img').at(0).attribute('alt').toString()?.replaceAll('<wbr>', '') ?? null,
                link: node.nthChild(5).nthChild(1).nthChild(3).nodesByClass('bfv-matchdata-result__team--team0').at(0).nodesByClass('bfv-matchdata-result__team-link').at(0).attribute('href').toString(),
                iconLink: node.nthChild(5).nthChild(1).nthChild(3).nodesByClass('bfv-matchdata-result__team--team0').at(0).nodesByClass('bfv-matchdata-result__team-icon').at(0).nodesByTag('img').at(0).attribute('src').toString()
            },
            awayTeam: {
                name: node.nthChild(5).nthChild(1).nthChild(3).nodesByClass('bfv-matchdata-result__team--team1').at(0).nodesByClass('bfv-matchdata-result__team-icon').at(0).nodesByTag('img').at(0).attribute('alt').toString()?.replaceAll('<wbr>', '') ?? null,
                link: node.nthChild(5).nthChild(1).nthChild(3).nodesByClass('bfv-matchdata-result__team--team1').at(0).nodesByClass('bfv-matchdata-result__team-link').at(0).attribute('href').toString(),
                iconLink: node.nthChild(5).nthChild(1).nthChild(3).nodesByClass('bfv-matchdata-result__team--team1').at(0).nodesByClass('bfv-matchdata-result__team-icon').at(0).nodesByTag('img').at(0).attribute('src').toString()
            },
            adress: `${adress1}, ${adress2}`,
            adressDescription: adress.regexGroup(/^(?<description>[\S\s]+?)\|[\S\s]+?\|[\S\s]+?$/g, 'description').toString()
        });
    }
    
    private async fetchLivetickerIdsFromGamePage(gameId: string): Promise<string[]> {
        try {
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
        } catch (error) {
            console.log(`Couldn't fetch liveticker ids: ${error}`);
            return [];
        }
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
        date: string,
        homeTeam: ReturnType.Team;
        awayTeam: ReturnType.Team;
        adress: string;
        adressDescription: string;
        livetickers: ({ id: string; } & BfvLiveticker)[];
    };

    export namespace ReturnType {
        export type Team = {
            name: string;
            link: string;
            iconLink: string;
        }
    }

    export type CallParameters = {
        gameId: string;
    }
}
