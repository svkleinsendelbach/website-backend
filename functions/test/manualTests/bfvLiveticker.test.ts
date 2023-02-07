import { callFunction, expectSuccess } from '../utils';
import * as fs from 'fs';
import { BfvLiveticker } from '../../src/classes/BfvLiveticker';
import { Crypter } from '../../src/crypter/Crypter';
import { cryptionKeys } from '../privateKeys';
import { BfvLivetickerFunction } from '../../src/regularFunctions/BfvLivetickerFunction';
import { guid } from '../../src/classes/guid';
import gameIds from '../dataset/gameIds.json';

describe('bfv liveticker', () => {
    afterEach(async () => {
        const result = await callFunction('deleteAllData', {});
        expectSuccess(result).to.be.equal(undefined);
    });

    it('liveticker', async () => {
        const types = ['comment', 'section', 'whistle', 'corner', 'penalty', 'ownGoal', 'time', 'specialAction', 'freeKick', 'shotOnGoal', 'goal', 'penaltyGoal', 'substitute', 'yellowCard', 'secondYellowCard', 'redCard'];
        const results: Record<string, BfvLiveticker.Result[]> = {};
        for (const type of types) 
            results[type] = [];
        let i = 0;
        for (const gameId of gameIds) {
            i += 1;
            console.log(`${i} / ${gameIds.length} | ${gameId}`);
            const crypter = new Crypter(cryptionKeys);
            const firebaseFunction = new BfvLivetickerFunction({
                databaseType: 'testing',
                parameters: crypter.encodeEncrypt({
                    databaseType: 'testing',
                    fiatShamirParameters: {
                        identifier: guid.newGuid().guidString,
                        cs: [0n, 1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n, 11n, 12n, 13n, 14n, 15n, 16n, 17n, 18n, 19n, 20n, 21n, 22n, 23n, 24n, 25n, 26n, 27n, 28n, 29n, 30n, 31n]
                    },
                    gameId: gameId
                })
            }, undefined);
            try {
                const functionResult = await firebaseFunction.executeFunction();
                for (const liveticker of functionResult.livetickers) {
                    for (const result of liveticker.results) {
                        if (results[result.type].length === 10) continue;
                        results[result.type].push(result);
                    }
                }
            } catch (error) {
                if (typeof error !== 'object' || error === null || !('code' in error) || error.code !== 'not-found') throw error;
            }
        }
        fs.writeFileSync('/Users/steven/Documents/Programmierung/svkleinsendelbach-website/svkleinsendelbach-website-backend/functions/test/output/livetickerResults.json', JSON.stringify(Object.values(results).flatMap(v => v), undefined, 2));
    });
});
