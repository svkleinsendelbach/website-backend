import { expect } from 'firebase-function/lib/src/testUtils';
import { HexByte } from '../src/types/HexByte';
import { Color } from '../src/types/Color';
import { Logger, VerboseType } from 'firebase-function';

describe('hexByte', () => {
    it('toByte', () => {
        expect(HexByte.toByte('00')).to.be.equal(0);
        expect(HexByte.toByte('04')).to.be.equal(4);
        expect(HexByte.toByte('0A')).to.be.equal(10);
        expect(HexByte.toByte('50')).to.be.equal(80);
        expect(HexByte.toByte('D0')).to.be.equal(208);
        expect(HexByte.toByte('5E')).to.be.equal(94);
        expect(HexByte.toByte('55')).to.be.equal(85);
        expect(HexByte.toByte('FF')).to.be.equal(255);
    });

    it('toPercent', () => {
        expect(HexByte.toPercentage('00')).to.be.equal(0);
        expect(HexByte.toPercentage('04')).to.be.equal(4 / 255);
        expect(HexByte.toPercentage('0A')).to.be.equal(2 / 51);
        expect(HexByte.toPercentage('50')).to.be.equal(16 / 51);
        expect(HexByte.toPercentage('D0')).to.be.equal(208 / 255);
        expect(HexByte.toPercentage('5E')).to.be.equal(94 / 255);
        expect(HexByte.toPercentage('55')).to.be.equal(1 / 3);
        expect(HexByte.toPercentage('FF')).to.be.equal(1);
    });

    it('fromByte', () => {
        expect(HexByte.fromByte(0)).to.be.equal('00');
        expect(HexByte.fromByte(4)).to.be.equal('04');
        expect(HexByte.fromByte(10)).to.be.equal('0A');
        expect(HexByte.fromByte(80)).to.be.equal('50');
        expect(HexByte.fromByte(208)).to.be.equal('D0');
        expect(HexByte.fromByte(94)).to.be.equal('5E');
        expect(HexByte.fromByte(85)).to.be.equal('55');
        expect(HexByte.fromByte(255)).to.be.equal('FF');
    });

    it('fromPercent', () => {
        expect(HexByte.fromPercentage(0)).to.be.equal('00');
        expect(HexByte.fromPercentage(4 / 255)).to.be.equal('04');
        expect(HexByte.fromPercentage(2 / 51)).to.be.equal('0A');
        expect(HexByte.fromPercentage(16 / 51)).to.be.equal('50');
        expect(HexByte.fromPercentage(208 / 255)).to.be.equal('D0');
        expect(HexByte.fromPercentage(94 / 255)).to.be.equal('5E');
        expect(HexByte.fromPercentage(1 / 3)).to.be.equal('55');
        expect(HexByte.fromPercentage(1)).to.be.equal('FF');
    });
});

describe('color', () => {
    it('fromString', () => {
        const logger = Logger.start(new VerboseType('none'), 'color.test.fromString');
        expect(Color.fromString('#000000', logger.nextIndent)).to.be.deep.equal({ red: '00', green: '00', blue: '00' });
        expect(Color.fromString('#12ABD4', logger.nextIndent)).to.be.deep.equal({ red: '12', green: 'AB', blue: 'D4' });
    });
});
