import { expect } from 'chai';
import { httpsCallable } from 'firebase/functions';
import { DatabaseType } from '../../src/classes/DatabaseType';
import { FiatShamirParameters } from '../../src/classes/FiatShamirParameters';
import { guid } from '../../src/classes/guid';
import { Crypter } from '../../src/crypter/Crypter';
import { cryptionKeys } from '../privateKeys';
import { callFunction, expectFailed, expectSuccess, functions, getCurrentUser, setDatabaseValue, signInTestUser, signOutUser } from '../utils';

describe('General', () => {
    beforeEach(async () => {
        await signInTestUser();
    });

    afterEach(async () => {
        const result = await callFunction('v2_deleteAllData', {});
        expectSuccess(result).to.be.equal(undefined);
        await signOutUser();
    });

    it('check prerequirements not signed in', async () => {
        await signOutUser();
        const result = await callFunction('v2_checkUserAuthentication', {
            type: 'websiteEditing'
        });
        expectFailed(result).value('code').to.be.deep.equal('permission-denied');
    }); 

    it('check fiat shamir challenge generator not called', async () => {
        const databaseType = new DatabaseType('testing');
        const crypter = new Crypter(cryptionKeys);
        const fiatShamirParameters: FiatShamirParameters = {
            identifier: new guid('3FB9B206-DF47-44E0-95B5-59FC7EC50D8D'),
            cs: [
                0n, 1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n, 11n, 12n, 13n, 14n, 15n, 16n,
                17n, 18n, 19n, 20n, 21n, 22n, 23n, 24n, 25n, 26n, 27n, 28n, 29n, 30n, 31n
            ]
        };
        const callableFunction = httpsCallable<{
            verbose: boolean,
            databaseType: 'release' | 'debug' | 'testing',
            parameters: string
        }, string>(functions, 'v2_checkUserAuthentication');
        const httpsCallableResult = await callableFunction({
            verbose: true,
            databaseType: databaseType.value,
            parameters: crypter.encodeEncrypt({
                fiatShamirParameters: fiatShamirParameters,
                databaseType: databaseType.value,
                type: 'websiteEditing'
            })
        });
        const result = crypter.decryptDecode(httpsCallableResult.data);
        expectFailed(result).value('code').to.be.deep.equal('unauthenticated');
    });
    
    it('check fiat shamir challenge expired', async () => {
        const crypter = new Crypter(cryptionKeys);
        const encrypedBsAndChallenges = crypter.encodeEncrypt({
            bs: [
                0n, 1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n, 11n, 12n, 13n, 14n, 15n, 16n,
                17n, 18n, 19n, 20n, 21n, 22n, 23n, 24n, 25n, 26n, 27n, 28n, 29n, 30n, 31n
            ],
            challenges: [
                0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0,
                1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1
            ],
            expireDate: new Date(new Date().getTime() - 300000) // - 5 minutes
        });
        const identifier = guid.newGuid();
        await setDatabaseValue(`fiatShamir/${identifier.guidString}`, encrypedBsAndChallenges);
        const databaseType = new DatabaseType('testing');
        const fiatShamirParameters: FiatShamirParameters = {
            identifier: identifier,
            cs: [
                0n, 1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n, 11n, 12n, 13n, 14n, 15n, 16n,
                17n, 18n, 19n, 20n, 21n, 22n, 23n, 24n, 25n, 26n, 27n, 28n, 29n, 30n, 31n
            ]
        };
        const callableFunction = httpsCallable<{
            verbose: boolean,
            databaseType: 'release' | 'debug' | 'testing',
            parameters: string
        }, string>(functions, 'v2_checkUserAuthentication');
        const httpsCallableResult = await callableFunction({
            verbose: true,
            databaseType: databaseType.value,
            parameters: crypter.encodeEncrypt({
                fiatShamirParameters: fiatShamirParameters,
                databaseType: databaseType.value,
                type: 'websiteEditing'
            })
        });
        const result = crypter.decryptDecode(httpsCallableResult.data);
        expectFailed(result).value('code').to.be.deep.equal('unauthenticated');
    });
    
    it('check fiat shamir challenge failed', async () => {
        const crypter = new Crypter(cryptionKeys);
        const encrypedBsAndChallenges = crypter.encodeEncrypt({
            bs: [
                0n, 1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n, 11n, 12n, 13n, 14n, 15n, 16n,
                17n, 18n, 19n, 20n, 21n, 22n, 23n, 24n, 25n, 26n, 27n, 28n, 29n, 30n, 31n
            ],
            challenges: [
                0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0,
                1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1
            ],
            expireDate: new Date(new Date().getTime() + 300000) // + 5 minutes
        });
        const identifier = guid.newGuid();
        await setDatabaseValue(`fiatShamir/${identifier.guidString}`, encrypedBsAndChallenges);
        const databaseType = new DatabaseType('testing');
        const fiatShamirParameters: FiatShamirParameters = {
            identifier: identifier,
            cs: [
                0n, 1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n, 11n, 12n, 13n, 14n, 15n, 16n,
                17n, 18n, 19n, 20n, 21n, 22n, 23n, 24n, 25n, 26n, 27n, 28n, 29n, 30n, 31n
            ]
        };
        const callableFunction = httpsCallable<{
            verbose: boolean,
            databaseType: 'release' | 'debug' | 'testing',
            parameters: string
        }, string>(functions, 'v2_checkUserAuthentication');
        const httpsCallableResult = await callableFunction({
            verbose: true,
            databaseType: databaseType.value,
            parameters: crypter.encodeEncrypt({
                fiatShamirParameters: fiatShamirParameters,
                databaseType: databaseType.value,
                type: 'websiteEditing'
            })
        });
        const result = crypter.decryptDecode(httpsCallableResult.data);
        expectFailed(result).value('code').to.be.deep.equal('unauthenticated');
    });
    
    it('check user authentication not authenticated', async () => {
        const result = await callFunction('v2_checkUserAuthentication', {
            type: 'websiteEditing'
        });
        expectFailed(result).value('code').to.be.equal('permission-denied');
    });
    
    it('check user authentication unauthenticated', async () => {
        const crypter = new Crypter(cryptionKeys);
        await setDatabaseValue(`users/authentication/websiteEditing/${Crypter.sha512(getCurrentUser()!.uid)}`, crypter.encodeEncrypt({
            state: 'unauthenticated',
            firstName: 'first',
            lastName: 'last'
        }));
        const result = await callFunction('v2_checkUserAuthentication', {
            type: 'websiteEditing'
        });
        expectFailed(result).value('code').to.be.equal('permission-denied');
    });
    
    it('authenication valid', async () => {
        const crypter = new Crypter(cryptionKeys);
        await setDatabaseValue(`users/authentication/websiteEditing/${Crypter.sha512(getCurrentUser()!.uid)}`, crypter.encodeEncrypt({
            state: 'authenticated',
            firstName: 'first',
            lastName: 'last'
        }));
        const result = await callFunction('v2_checkUserAuthentication', {
            type: 'websiteEditing'
        });
        expectSuccess(result).to.be.equal(undefined);
    });

    it('create function no database type', async () => {
        try {
            const callableFunction = httpsCallable<Record<string, never>, string>(functions, 'v2_checkUserAuthentication');
            await callableFunction({});
        } catch (error: any) {
            expect(error.code).to.be.equal('functions/invalid-argument');
            return;
        }
        expect.fail('Function should throw.');
    });
});
