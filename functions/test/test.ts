import { Crypter, DatabaseType, Logger, VerboseType } from "firebase-function";
import { GameInfoGetFunction } from "../src/functions/GameInfoGetFunction";
import { cryptionKeys } from "./privateKeys";

it('test', async () => {
    const logger = Logger.start(new VerboseType('none'), 'test');
    const crypter = new Crypter(cryptionKeys);
    const gameInfoGetFunction = new GameInfoGetFunction({
        databaseType: new DatabaseType('testing'),
        parameters: crypter.encodeEncrypt({
            gameId: '02MFJ7DBSG000000VS5489B3VUHHBIEF'
        })
    }, undefined, logger.nextIndent);
    const result = await gameInfoGetFunction.executeFunction();
    console.log(result);
});