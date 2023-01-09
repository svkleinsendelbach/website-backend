import { Logger } from '../src/utils/Logger';
import { ParameterBuilders, ParameterParser } from '../src/utils/Parameter/ParameterParser';
import { ParameterContainer } from '../src/utils/Parameter/ParameterContainer';
import { expect } from 'chai';
import { Crypter } from '../src/crypter/Crypter';
import { cryptionKeys } from '../src/privateKeys';
import { DatabaseType } from '../src/classes/DatabaseType';
import { ParameterBuilder } from '../src/utils/Parameter/ParameterBuilder';
import { httpsError } from '../src/utils/utils';
import { expectHttpsError } from './utils';

class StringClassType {
    public constructor(public value: 'v1' | 'v2' | 'v3') {}
}

namespace StringClassType {
    export function fromString(value: string, logger: Logger): StringClassType {
        if (value !== 'v1' && value !== 'v2' && value !== 'v3')
            throw httpsError('internal', '', logger);
        return new StringClassType(value);
    }
}

class NumberClassType {
    public constructor(public value: number) {}
}

namespace NumberClassType {
    export function fromNumber(value: number): NumberClassType {
        return new NumberClassType(value);
    }
}
class ObjectClassType {
    public constructor(public v1: string, public v2: number) {}
}

namespace ObjectClassType {
    export function fromObject(value: object, logger: Logger): ObjectClassType {
        if (!('v1' in value) || typeof value.v1 !== 'string')
            throw httpsError('internal', '', logger);
        if (!('v2' in value) || typeof value.v2 !== 'number')
            throw httpsError('internal', '', logger);
        return new ObjectClassType(value.v1, value.v2);
    }
}

describe('ParameterParser', () => {
    const logger = Logger.start('coloredVerbose', 'ParameterParserTest');

    function testParameterParser<Parameters>(
        parameterToParse: any,
        builders: ParameterBuilders<Parameters>,
        expectedParameters: Parameters
    ) {
        const crypter = new Crypter(cryptionKeys(new DatabaseType('testing')));
        const parameterContainer = new ParameterContainer({
            databaseType: 'testing',
            parameters: crypter.encodeEncrypt(parameterToParse)
        }, logger.nextIndent);
        const parameterParser = new ParameterParser<Parameters>(builders, logger.nextIndent);
        parameterParser.parseParameters(parameterContainer);
        expect(parameterParser.parameters).to.be.deep.equal(expectedParameters);
    }

    it('get parameter before parsing', () => {
        expectHttpsError(() => {
            const parameterParser = new ParameterParser<{
                value: string,
            }>({
                value: ParameterBuilder.trivialBuilder('string')
            }, logger.nextIndent);
            parameterParser.parameters;
        }, 'internal');
    });

    it('empty parameter', () => {
        testParameterParser<Record<string, never>>({}, {}, {});
    });

    it('only primitive types and object', () => {
        testParameterParser<{
            value1: string,
            value2: number,
            value3: object,
        }>({
            value1: 'asdf',
            value2: 12,
            value3: {
                subValue1: 'ghjk',
                subValue2: 98
            }
        }, {
            value1: ParameterBuilder.trivialBuilder('string'),
            value2: ParameterBuilder.trivialBuilder('number'),
            value3: ParameterBuilder.trivialBuilder('object')
        }, {
            value1: 'asdf',
            value2: 12,
            value3: {
                subValue1: 'ghjk',
                subValue2: 98
            }
        });
    });

    it('only builders', () => {
        testParameterParser<{
            value1: StringClassType,
            value2: NumberClassType,
            value3: ObjectClassType,
        }>({
            value1: 'v1',
            value2: 12.50,
            value3: {
                v1: 'a',
                v2: 3
            }
        }, {
            value1: ParameterBuilder.builder('string', StringClassType.fromString),
            value2: ParameterBuilder.builder('number', NumberClassType.fromNumber),
            value3: ParameterBuilder.builder('object', ObjectClassType.fromObject)
        }, {
            value1: new StringClassType('v1'),
            value2: new NumberClassType(12.50),
            value3: new ObjectClassType('a', 3)
        });
    });

    it('primitive types, object and builders', () => {
        testParameterParser<{
            value1: number,
            value2: StringClassType,
        }>({
            value1: 23.9,
            value2: 'v3'
        }, {
            value1: ParameterBuilder.trivialBuilder('number'),
            value2: ParameterBuilder.builder('string', StringClassType.fromString)
        }, {
            value1: 23.9,
            value2: new StringClassType('v3')
        });
    });

    it('builder throws', () => {
        try {
            testParameterParser<{
                value1: StringClassType,
            }>({
                value1: 'invalid'
            }, {
                value1: ParameterBuilder.builder('string', StringClassType.fromString)
            }, {
                value1: new StringClassType('v1')
            });
            expect(true).to.be.false;
        } catch (error: any) {
            expect(error.code).to.be.equal('internal');
        }
    });

    it('also parse database type', () => {
        testParameterParser<{
            value1: string,
            databaseType: DatabaseType,
        }>({
            value1: 'as',
            databaseType: 'testing'
        }, {
            value1: ParameterBuilder.trivialBuilder('string'),
            databaseType: ParameterBuilder.builder('string', DatabaseType.fromString)
        }, {
            value1: 'as',
            databaseType: new DatabaseType('testing')
        });
    });

    it('guard builder', () => {
        testParameterParser<{
            value: 'a' | 'b'
        }>({
            value: 'b'
        }, {
            value: ParameterBuilder.guardBuilder('string', (value: string): value is 'a' | 'b' => value === 'a' || value === 'b')
        }, {
            value: 'b'
        });
    });

    it('optional builder', () => {
        testParameterParser<{
            value1a: number | undefined,
            value1b: number | undefined,
            value2a: 'a' | 'b' | undefined,
            value2b: 'a' | 'b' | undefined,
            value3a: DatabaseType | undefined
            value3b: DatabaseType | undefined,
            value4a: undefined,
            value4b: undefined
        }>({
            value1a: 12,
            value1b: undefined,
            value2a: 'a',
            value2b: undefined,
            value3a: 'testing',
            value3b: undefined,
            value4a: undefined,
            value4b: null
        }, {
            value1a: ParameterBuilder.optionalBuilder(ParameterBuilder.trivialBuilder('number')),
            value1b: ParameterBuilder.optionalBuilder(ParameterBuilder.trivialBuilder('number')),
            value2a: ParameterBuilder.optionalBuilder(ParameterBuilder.guardBuilder('string', (value: string): value is 'a' | 'b' => value === 'a' || value === 'b')),
            value2b: ParameterBuilder.optionalBuilder(ParameterBuilder.guardBuilder('string', (value: string): value is 'a' | 'b' => value === 'a' || value === 'b')),
            value3a: ParameterBuilder.optionalBuilder(ParameterBuilder.builder('string', DatabaseType.fromString)),
            value3b: ParameterBuilder.optionalBuilder(ParameterBuilder.builder('string', DatabaseType.fromString)),
            value4a: ParameterBuilder.optionalBuilder(ParameterBuilder.builder('undefined', (value: undefined) => value)),
            value4b: ParameterBuilder.optionalBuilder(ParameterBuilder.builder('undefined', (value: undefined) => value))
        }, {
            value1a: 12,
            value1b: undefined,
            value2a: 'a',
            value2b: undefined,
            value3a: new DatabaseType('testing'),
            value3b: undefined,
            value4a: undefined,
            value4b: undefined
        });
    });

    it('invalid type', () => {
        expectHttpsError(() => {
            testParameterParser<{
                value: string
            }>({
                value: 'asdf'
            }, {
                value: new ParameterBuilder(['number'], v => v.toString())
            }, {
                value: 'asdf'
            });
        }, 'invalid-argument');
    });

    it('invalid undefined type', () => {
        expectHttpsError(() => {
            testParameterParser<{
                value: string
            }>({
                value: undefined
            }, {
                value: new ParameterBuilder(['number'], v => v.toString())
            }, {
                value: 'asdf'
            });
        }, 'invalid-argument');
    });

    it('failed guard builder', () => {
        expectHttpsError(() => {
            testParameterParser<{
                value: 'a' | 'b'
            }>({
                value: 'c'
            }, {
                value: ParameterBuilder.guardBuilder('string', (value: string): value is 'a' | 'b' => value === 'a' || value === 'b')
            }, {
                value: 'a'
            });
        }, 'invalid-argument');
    });

    it('parameter container data undefined', () => {
        expectHttpsError(() => {
            new ParameterContainer(undefined, logger.nextIndent);
        }, 'invalid-argument');
    });

    it('parameter container data null', () => {
        expectHttpsError(() => {
            new ParameterContainer(null, logger.nextIndent);
        }, 'invalid-argument');
    });

    it('parameter container database type undefined', () => {
        expectHttpsError(() => {
            new ParameterContainer({}, logger.nextIndent);
        }, 'invalid-argument');
    });

    it('parameter container database type not string', () => {
        expectHttpsError(() => {
            new ParameterContainer({
                databaseType: 1
            }, logger.nextIndent);
        }, 'invalid-argument');
    });

    it('parameter container parameters undefined', () => {
        expectHttpsError(() => {
            new ParameterContainer({
                databaseType: 'testing'
            }, logger.nextIndent);
        }, 'invalid-argument');
    });

    it('parameter container parameters not string', () => {
        expectHttpsError(() => {
            new ParameterContainer({
                databaseType: 'testing',
                parameters: 1
            }, logger.nextIndent);
        }, 'invalid-argument');
    });
});
