import { Crypter } from '../crypter/Crypter';
import { cryptionKeys, fiatShamirKeys } from '../privateKeys';
import { DatabaseType } from '../classes/DatabaseType';
import { Logger } from './Logger';
import { httpsError, modularPower } from './utils';
import { FirebaseDatabase } from './FirebaseDatabase';
import { FiatShamirParameters } from '../classes/FiatShamirParameters';

export async function checkFiatShamir(parameters: FiatShamirParameters, databaseType: DatabaseType, logger: Logger) {
    const crypter = new Crypter(cryptionKeys(databaseType));
    const reference = FirebaseDatabase.Reference.fromPath(`fiatShamir/${parameters.identifier.guidString}`, databaseType);
    const snapshot = await reference.snapshot<string>();
    if (!snapshot.exists)
        throw httpsError('unauthenticated', 'Couldn\'t get bs and challenges.', logger);
    const bsAndChallenges: {
        bs: bigint[],
        challenges: (0 | 1)[],
        expireDate: string
    } = crypter.decryptDecode(snapshot.value);
    await reference.remove();
    if (new Date(bsAndChallenges.expireDate) < new Date())
        throw httpsError('unauthenticated', 'bs and challenges are expired.', logger);
    for (let i = 0; i < 32; i++) {
        const cSquare = modularPower(parameters.cs[i], 2n, fiatShamirKeys.N);
        const expectedResult = ((bsAndChallenges.challenges[i] === 0 ? 1n : fiatShamirKeys.f) * bsAndChallenges.bs[i]) % fiatShamirKeys.N;
        if (cSquare !== expectedResult)
            throw httpsError('unauthenticated', 'Challenge failed.', logger);
    }
}
