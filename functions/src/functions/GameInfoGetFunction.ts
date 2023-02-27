import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, HtmlDom, HttpsError } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { getCryptionKeys } from '../privateKeys';
import { type BfvApiLiveticker, BfvLiveticker, type GameInfo } from '../types/GameInfo';
import DOMParser from 'dom-parser';
import fetch from 'cross-fetch';
import * as fontkit from 'fontkit';

export class GameInfoGetFunction implements FirebaseFunction<GameInfoGetFunction.Parameters, GameInfoGetFunction.ReturnType> {
    public readonly parameters: GameInfoGetFunction.Parameters & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('GameInfoGetFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getCryptionKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<GameInfoGetFunction.Parameters>(
            {
                gameId: ParameterBuilder.value('string')
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<GameInfoGetFunction.ReturnType> {
        this.logger.log('GameInfoGetFunction.executeFunction', {}, 'info');
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

    private async fetchGameInfoFromGamePage(gameId: string): Promise<Omit<GameInfo, 'livetickers'>> {
        const url = `https://www.bfv.de/spiele/${gameId}`;
        const html = await (await fetch(url)).text();
        const dom = new HtmlDom(new DOMParser().parseFromString(html));
        const node = dom.nodesByClass('bfv-matchdata-stage').at(0).nthChild(1).nthChild(1);
        const homeTeamId = node.nthChild(5).nthChild(1).nthChild(3).nodesByClass('bfv-matchdata-result__team--team0').at(0).nodesByClass('bfv-matchdata-result__team-link').at(0).attribute('href').regexGroup(/^https:\/\/www\.bfv\.de\/mannschaften(?:\/\S+?)?\/(?<id>\S+?)$/g, 'id').toString();
        const awayTeamId = node.nthChild(5).nthChild(1).nthChild(3).nodesByClass('bfv-matchdata-result__team--team1').at(0).nodesByClass('bfv-matchdata-result__team-link').at(0).attribute('href').regexGroup(/^https:\/\/www\.bfv\.de\/mannschaften(?:\/\S+?)?\/(?<id>\S+?)$/g, 'id').toString();
        if (homeTeamId === null || awayTeamId === null)
            throw HttpsError('not-found', 'Couldn\'t get ids for home and away team.', this.logger);
        const homeImageId = node.nthChild(5).nthChild(1).nthChild(3).nodesByClass('bfv-matchdata-result__team--team0').at(0).nodesByClass('bfv-matchdata-result__team-icon').at(0).nodesByTag('img').at(0).attribute('src').regexGroup(/^\/\/service-prod\.bfv\.de\/export\.media\?action=getLogo&format=7&id=(?<id>\S+?)$/g, 'id').toString();
        const awayImageId = node.nthChild(5).nthChild(1).nthChild(3).nodesByClass('bfv-matchdata-result__team--team1').at(0).nodesByClass('bfv-matchdata-result__team-icon').at(0).nodesByTag('img').at(0).attribute('src').regexGroup(/^\/\/service-prod\.bfv\.de\/export\.media\?action=getLogo&format=7&id=(?<id>\S+?)$/g, 'id').toString();
        if (homeImageId === null || awayImageId === null)
            throw HttpsError('not-found', 'Couldn\'t get ids for home and away team images.', this.logger);
        const dateValue = node.nthChild(3).nthChild(5).nthChild(3).value;
        const date1 = dateValue.regexGroup(/^\s*(?<date>\d{2})\.\d{2}\.\d{4}\s+\/\d{2}:\d{2} Uhr\s*$/g, 'date').toString();
        const date2 = dateValue.regexGroup(/^\s*\d{2}\.(?<date>\d{2})\.\d{4}\s+\/\d{2}:\d{2} Uhr\s*$/g, 'date').toString();
        const date3 = dateValue.regexGroup(/^\s*\d{2}\.\d{2}\.(?<date>\d{4})\s+\/\d{2}:\d{2} Uhr\s*$/g, 'date').toString();
        const date4 = dateValue.regexGroup(/^\s*\d{2}\.\d{2}\.\d{4}\s+\/(?<time>\d{2}:\d{2}) Uhr\s*$/g, 'time').toString();
        const date = date1 === null || date2 === null || date3 === null || date4 === null ? null : `${date3}-${date2}-${date1}T${date4}:00.000Z`;
        const adressValue = dom.nodesByClass('bfv-game-info').at(0).nthChild(1).nthChild(1).nthChild(1).nthChild(1).nthChild(3).value;
        const adress1 = adressValue.regexGroup(/^[\S\s]+?\|(?<street>[\S\s]+?)\|[\S\s]+?$/g, 'street').toString();
        const adress2 = adressValue.regexGroup(/^[\S\s]+?\|[\S\s]+?\|(?<city>[\S\s]+?)$/g, 'city').toString();
        const adress = adress1 === null || adress2 === null ? null : `${adress1}, ${adress2}`;
        const title = dom.nodesByTag('head').at(0).nodesByTag('title').at(0).value;
        return ensureNotNullable<Omit<GameInfo, 'livetickers'>>({
            id: gameId,
            competition: {
                name: node.nthChild(3).nthChild(1).nthChild(1).value.toString(),
                link: node.nthChild(3).nthChild(1).attribute('href').toString(),
                gameDay: node.nthChild(3).nthChild(3).value.regexGroup(/^(?<day>\d+?)\. Spieltag$/g, 'day').toInt()
            },
            result: {
                home: await this.mapResult(dom.nodesByClass('bfv-matchdata-result__goals-wrapper').at(0).nthChild(1).value.toString(), dom.nodesByClass('bfv-matchdata-result__goals-wrapper').at(0).nthChild(1).attribute('data-font-url').regexGroup(/^\/\/app\.bfv\.de\/export\.fontface\/-\/id\/(?<id>\S+?)\/type\/css$/g, 'id').toString()),
                away: await this.mapResult(dom.nodesByClass('bfv-matchdata-result__goals-wrapper').at(0).nthChild(5).value.toString(), dom.nodesByClass('bfv-matchdata-result__goals-wrapper').at(0).nthChild(5).attribute('data-font-url').regexGroup(/^\/\/app\.bfv\.de\/export\.fontface\/-\/id\/(?<id>\S+?)\/type\/css$/g, 'id').toString())
            },
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

    private async mapResult(rawResult: string | null, fontId: string | null): Promise<number | undefined> {
        if (rawResult === null || fontId === null)
            return undefined;
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
                return undefined;
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

export namespace GameInfoGetFunction {
    export type Parameters = {
        gameId: string;
    };

    export type ReturnType = GameInfo;
}

export type Nullable<T> = {
    [P in keyof T]: Nullable<T[P]> | null;
};

export function ensureNotNullable<T>(nullableValue: Nullable<T>, previousKeyPath: string = ''): T {
    if (nullableValue === null)
        throw new Error(`Ensure not null failed: ${previousKeyPath} is null.`);
    if (typeof nullableValue !== 'object' || Array.isArray(nullableValue))
        return nullableValue as T;
    const value: T = {} as T;
    for (const entry of Object.entries(nullableValue)) {
        if (entry[1] === null)
            throw new Error(`Ensure not null failed: ${previousKeyPath}/${entry[0]} is null.`);
        value[entry[0] as keyof T] = ensureNotNullable(entry[1] as Nullable<T[keyof T]>, `${previousKeyPath}/${entry[0]}`);
    }
    return value;
}
