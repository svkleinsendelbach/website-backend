import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, HtmlDom, HttpsError, type FunctionType, UtcDate } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { getPrivateKeys } from '../privateKeys';
import { type GameInfo } from '../types/GameInfo';
import DOMParser from 'dom-parser';
import fetch from 'cross-fetch';
import * as fontkit from 'fontkit';

export class GameInfoGetFunction implements FirebaseFunction<GameInfoGetFunctionType> {
    public readonly parameters: FunctionType.Parameters<GameInfoGetFunctionType> & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('GameInfoGetFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getPrivateKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<FunctionType.Parameters<GameInfoGetFunctionType>>(
            {
                gameId: ParameterBuilder.value('string')
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<GameInfoGetFunctionType>> {
        this.logger.log('GameInfoGetFunction.executeFunction', {}, 'info');
        const gameInfo = await this.fetchGameInfoFromGamePage(this.parameters.gameId);
        return gameInfo;
    }

    private async fetchGameInfoFromGamePage(gameId: string): Promise<GameInfo> {
        const url = `https://www.bfv.de/spiele/${gameId}`;
        const html = await (await fetch(url)).text();
        const dom = new HtmlDom(new DOMParser().parseFromString(html));
        const gameReport = this.getGameReport(dom);
        const node = dom.nodesByClass('bfv-matchdata-stage').at(0).nthChild(1).nthChild(1);
        const homeTeamId = node.nthChild(5).nthChild(1).nthChild(3).nodesByClass('bfv-matchdata-result__team--team0').at(0).nodesByClass('bfv-matchdata-result__team-link').at(0).attribute('href').regexGroup(/^https:\/\/www\.bfv\.de\/mannschaften(?:\/\S+?)?\/(?<id>\S+?)$/g, 'id').toString();
        const awayTeamId = node.nthChild(5).nthChild(1).nthChild(3).nodesByClass('bfv-matchdata-result__team--team1').at(0).nodesByClass('bfv-matchdata-result__team-link').at(0).attribute('href').regexGroup(/^https:\/\/www\.bfv\.de\/mannschaften(?:\/\S+?)?\/(?<id>\S+?)$/g, 'id').toString();
        if (homeTeamId === null || awayTeamId === null)
            throw HttpsError('not-found', 'Couldn\'t get ids for home and away team.', this.logger);
        const homeImageId = node.nthChild(5).nthChild(1).nthChild(3).nodesByClass('bfv-matchdata-result__team--team0').at(0).nodesByClass('bfv-matchdata-result__team-icon').at(0).nodesByTag('img').at(0).attribute('src').regexGroup(/^\/\/service-prod\.bfv\.de\/export\.media\?action=getLogo&format=7&id=(?<id>\S+?)$/g, 'id').toString();
        const awayImageId = node.nthChild(5).nthChild(1).nthChild(3).nodesByClass('bfv-matchdata-result__team--team1').at(0).nodesByClass('bfv-matchdata-result__team-icon').at(0).nodesByTag('img').at(0).attribute('src').regexGroup(/^\/\/service-prod\.bfv\.de\/export\.media\?action=getLogo&format=7&id=(?<id>\S+?)$/g, 'id').toString();
        if (homeImageId === null || awayImageId === null)
            throw HttpsError('not-found', 'Couldn\'t get ids for home and away team images.', this.logger);
        const gameDay = node.nthChild(3).nthChild(3).value.regexGroup(/^(?<day>\d+?)\. Spieltag$/g, 'day').toInt();
        const dateValue = node.nthChild(3).nthChild(gameDay !== null ? 5 : 3).nthChild(3).value;
        const day = dateValue.regexGroup(/^\s*(?<day>\d{2})\.\d{2}\.\d{4}\s+\/\d{2}:\d{2} Uhr\s*$/g, 'day').toInt();
        const month = dateValue.regexGroup(/^\s*\d{2}\.(?<month>\d{2})\.\d{4}\s+\/\d{2}:\d{2} Uhr\s*$/g, 'month').toInt();
        const year = dateValue.regexGroup(/^\s*\d{2}\.\d{2}\.(?<year>\d{4})\s+\/\d{2}:\d{2} Uhr\s*$/g, 'year').toInt();
        const hour = dateValue.regexGroup(/^\s*\d{2}\.\d{2}\.\d{4}\s+\/(?<hour>\d{2}):\d{2} Uhr\s*$/g, 'hour').toInt();
        const minute = dateValue.regexGroup(/^\s*\d{2}\.\d{2}\.\d{4}\s+\/\d{2}:(?<minute>\d{2}) Uhr\s*$/g, 'minute').toInt();
        const date = year === null || month === null || day === null || hour === null || minute === null ? null : new UtcDate(year, month, day, hour, minute, 'Europe/Berlin').encoded;
        if (date === null)
            throw HttpsError('unavailable', 'Couldn\' get date.', this.logger);
        const adressValue = dom.nodesByClass('bfv-game-info').at(0).nthChild(1).nthChild(1).nthChild(1).nthChild(1).nthChild(3).value;
        const adress1 = adressValue.regexGroup(/^[\S\s]+?\|(?<street>[\S\s]+?)\|[\S\s]+?$/g, 'street').toString();
        const adress2 = adressValue.regexGroup(/^[\S\s]+?\|[\S\s]+?\|(?<city>[\S\s]+?)$/g, 'city').toString();
        const adress = adress1 === null || adress2 === null ? null : `${adress1}, ${adress2}`;
        const title = dom.nodesByTag('head').at(0).nodesByTag('title').at(0).value;
        return {
            id: gameId,
            competition: {
                name: node.nthChild(3).nthChild(1).nthChild(1).value.toString() ?? 'n.a.',
                link: node.nthChild(3).nthChild(1).attribute('href').toString(),
                gameDay: gameDay ?? 1
            },
            result: {
                home: await this.mapResult(dom.nodesByClass('bfv-matchdata-result__goals-wrapper').at(0).nthChild(1).value.toString(), dom.nodesByClass('bfv-matchdata-result__goals-wrapper').at(0).nthChild(1).attribute('data-font-url').regexGroup(/^\/\/app\.bfv\.de\/export\.fontface\/-\/id\/(?<id>\S+?)\/type\/css$/g, 'id').toString()),
                away: await this.mapResult(dom.nodesByClass('bfv-matchdata-result__goals-wrapper').at(0).nthChild(5).value.toString(), dom.nodesByClass('bfv-matchdata-result__goals-wrapper').at(0).nthChild(5).attribute('data-font-url').regexGroup(/^\/\/app\.bfv\.de\/export\.fontface\/-\/id\/(?<id>\S+?)\/type\/css$/g, 'id').toString())
            },
            date: date,
            homeTeam: {
                name: title.regexGroup(/^Spiel (?<name>[\S\s]+?) gegen [\S\s]+?&nbsp;\| BFV$/g, 'name').toString() ?? 'n.a.',
                id: homeTeamId,
                imageId: homeImageId
            },
            awayTeam: {
                name: title.regexGroup(/^Spiel [\S\s]+? gegen (?<name>[\S\s]+?)&nbsp;\| BFV$/g, 'name').toString() ?? 'n.a.',
                id: awayTeamId,
                imageId: awayImageId
            },
            adress: adress ?? null,
            adressDescription: adressValue.regexGroup(/^(?<description>[\S\s]+?)\|[\S\s]+?\|[\S\s]+?$/g, 'description').toString() ?? null,
            report: gameReport
        };
    }

    private getGameReport(dom: HtmlDom): GameInfo.Report | null {
        const node = dom.nodeById('tab-spieldetailreiter-spielverlauf').nthChild(1).nthChild(1).nthChild(3).nthChild(1).nthChild(1).nthChild(3);
        const title = node.nthChild(1).text?.trim() ?? null;
        const paragraphs = node.nthChild(3).children.compactMap(node => {
            const paragraph = node.children.compactMap(node => {
                if (node.text === null || node.text === '')
                    return null;
                return { text: node.text, link: node.attribute('href').toString() };
            });
            if (paragraph === null || paragraph.length === 0)
                return null;
            return paragraph;
        });
        return title === null || paragraphs === null ? null : { title: title, paragraphs: paragraphs };
    }

    private async mapResult(rawResult: string | null, fontId: string | null): Promise<number | null> {
        if (rawResult === null || fontId === null)
            return null;
        const fontUrl = `//app.bfv.de/export.fontface/-/format/ttf/id/${fontId}/type/font`;
        const font = fontkit.create(Buffer.from(await (await fetch(fontUrl)).arrayBuffer()));
        let result = 0;
        const regex = /&#x(?<codePoint>[0-9A-F]{4});/gm;
        let match;
        while ((match = regex.exec(rawResult)) !== null) {
            if (match.index === regex.lastIndex)
                regex.lastIndex++;
            const codePoint = Number.parseInt(match.groups?.codePoint ?? '', 16);
            const glyph = this.mapGlyph(codePoint, font);
            if (glyph === 'X' || glyph === '-')
                return null;
            result = 10 * result + glyph;
        }
        return result;
    }

    private mapGlyph(codePoint: number, font: fontkit.Font): 'X' | '-' | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 {
        switch (JSON.stringify(font.glyphForCodePoint(codePoint).bbox)) {
            case '{"minX":51,"minY":-9,"maxX":607,"maxY":547}': return 'X';
            case '{"minX":21,"minY":221,"maxX":331,"maxY":359}': return '-';
            case '{"minX":47,"minY":-5,"maxX":597,"maxY":748}': return 0;
            case '{"minX":26,"minY":0,"maxX":323,"maxY":748}': return 1;
            case '{"minX":43,"minY":0,"maxX":552,"maxY":748}': return 2;
            case '{"minX":36,"minY":-6,"maxX":539,"maxY":748}': return 3;
            case '{"minX":22,"minY":0,"maxX":609,"maxY":742}': return 4;
            case '{"minX":51,"minY":-6,"maxX":561,"maxY":742}': return 5;
            case '{"minX":43,"minY":-5,"maxX":564,"maxY":748}': return 6;
            case '{"minX":20,"minY":0,"maxX":537,"maxY":742}': return 7;
            case '{"minX":49,"minY":-5,"maxX":573,"maxY":748}': return 8;
            case '{"minX":40,"minY":-6,"maxX":560,"maxY":747}': return 9;
            default: return 'X';
        }
    }
}

export type GameInfoGetFunctionType = FunctionType<{
    gameId: string;
}, GameInfo>;
