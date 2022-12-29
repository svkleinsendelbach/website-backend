import { guid } from '../classes/guid';
import { Crypter } from '../crypter/Crypter';
import { cryptionKeys, fiatShamirKeys } from '../privateKeys';
import { DatabaseType } from './DatabaseType';
import { Logger } from './Logger';
import { arrayBuilder, httpsError, reference } from './utils';

export interface FiatShamirParameters {
    identifier: guid,
    cs: bigint[]
}

export namespace FiatShamirParameters {
    export function fromObject(value: object, logger: Logger): FiatShamirParameters {
        if (!('identifier' in value)) 
            throw httpsError('internal', 'Couldn\'t get fiat shamir parameters. No identifier in object.', logger);
        const identifier = guid.fromValue(value.identifier, logger.nextIndent);

        if (!('cs' in value)) 
            throw httpsError('internal', 'Couldn\'t get fiat shamir parameters. No cs in object.', logger);
        if (typeof value.cs !== 'object' || value.cs === null)
            throw httpsError('internal', 'Couldn\'t get fiat shamir parameters. cs isn\'t an object.', logger);
        const cs = arrayBuilder((element: any, logger: Logger) => {
            if (typeof element !== 'bigint')
                throw httpsError('invalid-argument', `c '${element}' is not a big int.`, logger);
            return element;
        }, 32)(value.cs, logger.nextIndent);

        return {
            identifier: identifier,
            cs: cs
        };
    }
}

export async function checkFiatShamir(parameters: FiatShamirParameters, databaseType: DatabaseType, logger: Logger) {
    const crypter = new Crypter(cryptionKeys(databaseType));
    const ref = reference(`fiatShamir/${parameters.identifier.guidString}`, databaseType, logger.nextIndent);
    const snapshot = await ref.once('value');
    if (!snapshot.exists())
        throw httpsError('unauthenticated', 'Couldn\'t get bs and challenges.', logger);
    const encrypedBsAndChallenges = snapshot.val();
    await ref.remove();
    const bsAndChallenges: {
        bs: bigint[],
        challenges: (0 | 1)[],
        expireDate: string
    } = crypter.decryptDecode(encrypedBsAndChallenges);
    if (new Date(bsAndChallenges.expireDate) > new Date())
        throw httpsError('unauthenticated', 'bs and challenges are expired.', logger);
    for (let i = 0; i < 32; i++) {
        const cSquare = modularPower(parameters.cs[i], 2n, fiatShamirKeys.N);
        const expectedResult = ((bsAndChallenges.challenges[i] === 0 ? 1n : fiatShamirKeys.f) * bsAndChallenges.bs[i]) % fiatShamirKeys.N;
        if (cSquare !== expectedResult)
            throw httpsError('unauthenticated', 'Challenge failed.', logger);
    }
}

function modularPower(base: bigint, exponent: bigint, modulus: bigint) {
    if (modulus === 1n) 
        return 0n;
    base %= modulus;
    let result = 1n;
    while (exponent > 0n) {
        if (exponent % 2n === 1n) 
            result = (result * base) % modulus;
        exponent >>= 1n; 
        base = (base ** 2n) % modulus;
    }
    return result;
}
