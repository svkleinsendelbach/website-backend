import { expect } from 'chai';
import { TeamSquadParser } from '../../src/WebsiteExtractor/TeamSquad/TeamSquadParser';
import { WebsiteFetcher } from '../../src/WebsiteExtractor/WebsiteFetcher';
import { callFunction, expectSuccess, setDatabaseValue } from '../utils';
import teamSquadData from '../dataset/teamSquadData.json';

describe('get team squad', () => {
    afterEach(async () => {
        const result = await callFunction('deleteAllData', {});
        expectSuccess(result).to.be.equal(undefined);
    });

    it('get team squad', async () => {
        const url = 'http://www.anpfiff.info/sites/team/kader.aspx?SK=2&Lg=28&Tm=30675&Ver=294&Sais=124&Men=19';
        const dom = await new WebsiteFetcher(url).fetch();
        const teamSquad = new TeamSquadParser(dom).parse();
        expect(teamSquad).to.be.deep.equal(teamSquadData);
    });

    it('get team squad with firebase function', async () => {
        await setDatabaseValue('anpfiffTeamParameter/first-team', {
            ligaId: 28,
            men: 19,
            saisonId: 124,
            spielkreis: 2,
            teamId: 30675,
            vereinId: 294
        });
        const result = await callFunction('getTeamSquad', {
            type: 'first-team'
        });
        expectSuccess(result).to.be.deep.equal(teamSquadData);
    });
});
