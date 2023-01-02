import { expect } from 'chai';
import { guid } from '../src/classes/guid';
import { Logger, LogLevel } from '../src/utils/Logger';
import { Result } from '../src/utils/Result';
import { StringBuilder } from '../src/utils/StringBuilder';
import { arrayBuilder, convertToFunctionResultError, isFunctionsErrorCode, Json, mapObject, modularPower, toResult, undefinedValuesAsNull } from '../src/utils/utils';
import { expectHttpsError } from './utils';

describe('utils', () => {
    const logger = Logger.start(true, 'utils');

    it('log level color', () => {
        expect(LogLevel.coloredText('debug', 'asdf')).to.be.equal('\x1b[33masdf\x1b[0m');
        expect(LogLevel.coloredText('info', 'asdf')).to.be.equal('\x1b[31masdf\x1b[0m');
        expect(LogLevel.coloredText('notice', 'asdf')).to.be.equal('\x1b[34masdf\x1b[0m');
    });

    describe('string builder', () => {
        it('initial string undefined', () => {
            expect(new StringBuilder().toString()).to.be.equal('');
        });

        it('initial string not undefined', () => {
            expect(new StringBuilder('asdf').toString()).to.be.equal('asdf');            
        });

        it('empty', () => {
            expect(new StringBuilder().isEmpty).to.be.true;
        });

        it('not empty', () => {
            expect(new StringBuilder('asdf').isEmpty).to.be.false;            
        });

        it('clear', () => {
            const stringBuilder = new StringBuilder('asdf');
            stringBuilder.clear();
            expect(stringBuilder.toString()).to.be.equal('');            
        });
    });

    describe('result', () => {
        it('success', () => {
            const result = Result.success<string, string>('asdf');
            expect(result.property).to.be.deep.equal({ value: 'asdf' });
            expect(result.get()).to.be.equal('asdf');
            expect(result.value).to.be.equal('asdf');
            expect(result.error).to.be.null;
            expect(result.valueOrError).to.be.equal('asdf');
            expect(result.map<string>(v => v + '_').property).to.be.deep.equal({ value: 'asdf_' });
            expect(result.mapError<string>(v => v + '_').property).to.be.deep.equal({ value: 'asdf' });
        });

        it('void success', () => {
            expect(Result.voidSuccess<string>().property).to.be.deep.equal({ value: undefined });
        });

        it('failure', () => {
            const result = Result.failure<string, string>('nrtz');
            expect(result.property).to.be.deep.equal({ error: 'nrtz' });
            try {
                result.get();
                expect.fail();
            } catch (error: any) {
                expect(error).to.be.equal('nrtz');
            }
            expect(result.value).to.be.null;
            expect(result.error).to.be.equal('nrtz');
            expect(result.valueOrError).to.be.equal('nrtz');
            expect(result.map<string>(v => v + '_').property).to.be.deep.equal({ error: 'nrtz' });
            expect(result.mapError<string>(v => v + '_').property).to.be.deep.equal({ error: 'nrtz_' });
        });
    });

    it('toResult success', async () => {
        const result = await toResult<string>(new Promise(resolve => resolve('asdf')));
        expect(result.property).to.be.deep.equal({
            value: {
                returnValue: 'asdf', state: 'success'
            }
        });
    });

    it('toResult failure', async () => {
        const result = await toResult<string>(new Promise((_resolve, reject) => reject(new Error('nzesd'))));
        expect((result.property as any).error.state).to.be.equal('failure');
        expect((result.property as any).error.error.message).to.be.equal('nzesd');
    });

    it('isFunctionsErrorCode invalid', () => {
        expect(isFunctionsErrorCode('')).to.be.false;
        expect(isFunctionsErrorCode('asdf')).to.be.false;
        expect(isFunctionsErrorCode('asdf-asdjo')).to.be.false;
    });

    it('isFunctionsErrorCode valid', () => {
        expect(isFunctionsErrorCode('ok')).to.be.true;
        expect(isFunctionsErrorCode('cancelled')).to.be.true;
        expect(isFunctionsErrorCode('unknown')).to.be.true;
        expect(isFunctionsErrorCode('invalid-argument')).to.be.true;
        expect(isFunctionsErrorCode('deadline-exceeded')).to.be.true;
        expect(isFunctionsErrorCode('not-found')).to.be.true;
        expect(isFunctionsErrorCode('already-exists')).to.be.true;
        expect(isFunctionsErrorCode('permission-denied')).to.be.true;
        expect(isFunctionsErrorCode('resource-exhausted')).to.be.true;
        expect(isFunctionsErrorCode('failed-precondition')).to.be.true;
        expect(isFunctionsErrorCode('aborted')).to.be.true;
        expect(isFunctionsErrorCode('out-of-range')).to.be.true;
        expect(isFunctionsErrorCode('unimplemented')).to.be.true;
        expect(isFunctionsErrorCode('internal')).to.be.true;
        expect(isFunctionsErrorCode('unavailable')).to.be.true;
        expect(isFunctionsErrorCode('data-loss')).to.be.true;
        expect(isFunctionsErrorCode('unauthenticated')).to.be.true;
    });

    it('convertToFunctionResultError', () => {
        expect(convertToFunctionResultError({ stack: 'asdf' })).to.be.deep.equal({
            code: 'unknown',
            details: {
                stack: 'asdf'
            },
            message: 'Unknown error occured, see details for more infos.',
            stack: 'asdf'
        });
    });

    it('arrayBuilder no array', () => {
        expectHttpsError(() => {
            arrayBuilder<number>(v => v)({}, logger.nextIndent);
        }, 'internal');
    });

    it('Json', () => {
        const data = {
            v1: 12n,
            v2: guid.newGuid()
        };
        const json = Json.stringify(data);
        expect(json).to.be.equal(`{"v1":"12#bigint","v2":"${data.v2.guidString}"}`);
        expect(Json.parse(json)).to.be.deep.equal({
            v1: 12n,
            v2: data.v2.guidString
        });
        expect(Json.parse(undefined)).to.be.undefined;
    });

    it('map object', () => {
        expect(mapObject({
            v: 12
        }, 'v', v => v.toString())).to.be.deep.equal({
            v: '12'
        });
    });

    it('modular power', () => {
        expect(modularPower(2n, 3n, 10n)).to.be.equal(8n);
        expect(modularPower(2n, 3n, 5n)).to.be.equal(3n);
        expect(modularPower(2n, 3n, 1n)).to.be.equal(0n);
    });

    it('colored text', () => {
        expect('a'.red()).to.be.equal('\x1b[31ma\x1b[0m');
        expect('b'.green()).to.be.equal('\x1b[32mb\x1b[0m');
        expect('c'.yellow()).to.be.equal('\x1b[33mc\x1b[0m');
        expect('d'.blue()).to.be.equal('\x1b[34md\x1b[0m');
        expect('e'.magenta()).to.be.equal('\x1b[35me\x1b[0m');
        expect('f'.cyan()).to.be.equal('\x1b[36mf\x1b[0m');
        expect('g'.gray()).to.be.equal('\x1b[40m\x1b[2mg\x1b[0m');
    });

    it('compact map', () => {
        expect([undefined, 1, undefined, undefined, 2, 3, undefined, 4].compactMap<number>(v => v)).to.be.deep.equal([1, 2, 3, 4]);
    });

    it('undefinedValuesAsNull', () => {
        expect(undefinedValuesAsNull(undefined)).to.be.equal(null);
        expect(undefinedValuesAsNull(null)).to.be.equal(null);
        expect(undefinedValuesAsNull(1)).to.be.equal(1);
        expect(undefinedValuesAsNull({
            value1: 1,
            value2: 'asdf',
            value3: null,
            value4: undefined
        })).to.be.deep.equal({
            value1: 1,
            value2: 'asdf',
            value3: null,
            value4: null
        });
        expect(undefinedValuesAsNull({
            value: {
                value1: 1,
                value2: 'asdf',
                value3: null,
                value4: undefined                    
            }
        })).to.be.deep.equal({
            value: {
                value1: 1,
                value2: 'asdf',
                value3: null,
                value4: null                  
            }
        });
        expect(undefinedValuesAsNull([
            undefined, 6, undefined, undefined, 1, 3
        ])).to.be.deep.equal([
            null, 6, null, null, 1, 3
        ]);
    });
});
