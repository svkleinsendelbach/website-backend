import { expect } from 'chai';
import { PseudoRandom } from '../src/crypter/PseudoRandom';
import { BytesToBitIterator } from '../src/crypter/BytesToBitIterator';
import { bits, xor, bitIteratorToBytes, addPadding, removePadding, unishortString } from '../src/crypter/utils';
import { RandomBitIterator } from '../src/crypter/RandomBitIterator';
import { CombineIterator } from '../src/crypter/CombineIterator';
import { Crypter } from '../src/crypter/Crypter';
import { FixedLength } from '../src/crypter/FixedLength';
import * as crypterTestData from './dataset/crypterTestData.json';
import { sha512 } from 'sha512-crypt-ts';

describe('Crypter', () => {
    describe('PseudoRandom', () => {
        it('random byte', () => {
            const pseudoRandom = new PseudoRandom(Uint8Array.from([0x1e, 0x33, 0x43, 0xe0, 0x25, 0x3a, 0xb5, 0xa0, 0xf9, 0x0d, 0x33, 0x95, 0x10, 0xaa, 0x7d, 0xee]));
            const expectedBytes = [223, 151, 156, 50, 123, 196, 29, 177, 74, 148, 156, 220, 244, 146, 22, 131, 21, 111, 117, 65, 23, 89, 254, 68, 206, 148, 185, 154, 156, 29, 165, 91];
            for (const expectedByte of expectedBytes) 
                expect(pseudoRandom.randomByte()).to.be.equal(expectedByte);
        });
    });

    describe('utils', () => {
        it('bits', () => {
            const dataset: [number, (0 | 1)[]][] = [
                [0x00, [0, 0, 0, 0, 0, 0, 0, 0]],
                [0x01, [0, 0, 0, 0, 0, 0, 0, 1]],
                [0x4e, [0, 1, 0, 0, 1, 1, 1, 0]],
                [0xff, [1, 1, 1, 1, 1, 1, 1, 1]]
            ];
            for (const data of dataset) 
                expect(bits(data[0])).to.be.deep.equal(data[1]);            
        });

        it('invalid bits', () => {
            try {
                bits(0x111);
            } catch (error: any) {
                expect(error.message).to.be.equal('Value isn\'t a valid byte.');
                return;
            }
            expect.fail('Expect error thrown');
        });

        it('xor', () => {
            expect(xor(0, 0)).to.be.equal(0);
            expect(xor(1, 1)).to.be.equal(0);
            expect(xor(0, 1)).to.be.equal(1);
            expect(xor(1, 0)).to.be.equal(1);
        });

        it('bitIteratorToBuffer 1', () => {
            const bitIterator: Iterator<0 | 1> = ([] as (0 | 1)[])[Symbol.iterator]();
            const buffer = bitIteratorToBytes(bitIterator);
            const expectedBuffer = Uint8Array.from([]);
            expect(buffer).to.be.deep.equal(expectedBuffer);
        });

        it('bitIteratorToBuffer 2', () => {
            const bitIterator: Iterator<0 | 1> = ([0, 0, 1, 0, 0, 0, 1, 1] as (0 | 1)[])[Symbol.iterator]();
            const buffer = bitIteratorToBytes(bitIterator);
            const expectedBuffer = Uint8Array.from([0x23]);
            expect(buffer).to.be.deep.equal(expectedBuffer);
        });

        it('bitIteratorToBuffer 3', () => {
            const bitIterator: Iterator<0 | 1> = ([
                0, 0, 1, 0, 0, 0, 1, 1,
                0, 1, 0, 0, 0, 1, 0, 1,
                0, 1, 1, 0, 0, 1, 1, 1,
                1, 0, 1, 0, 1, 1, 1, 1
            ] as (0 | 1)[])[Symbol.iterator]();
            const buffer = bitIteratorToBytes(bitIterator);
            const expectedBuffer = Uint8Array.from([0x23, 0x45, 0x67, 0xaf]);
            expect(buffer).to.be.deep.equal(expectedBuffer);
        });
    });

    describe('BufferToBitIterator', () => {
        it('buffer to bits 1', () => {
            const buffer = Uint8Array.from([]);
            const bufferToBitIterator = new BytesToBitIterator(buffer);
            const expectedBits: (0 | 1)[] = [];
            let bitResult = bufferToBitIterator.next();
            let index = 0;
            while (!(bitResult.done ?? false)) {
                expect(bitResult.value).to.be.equal(expectedBits[index]);
                bitResult = bufferToBitIterator.next();
                index += 1;
            }
        });

        it('buffer to bits 2', () => {
            const buffer = Uint8Array.from([0x23]);
            const bufferToBitIterator = new BytesToBitIterator(buffer);
            const expectedBits: (0 | 1)[] = [0, 0, 1, 0, 0, 0, 1, 1];
            let bitResult = bufferToBitIterator.next();
            let index = 0;
            while (!(bitResult.done ?? false)) {
                expect(bitResult.value).to.be.equal(expectedBits[index]);
                bitResult = bufferToBitIterator.next();
                index += 1;
            }
        });

        it('buffer to bits 3', () => {
            const buffer = Uint8Array.from([0x23, 0x45, 0x67, 0xaf]);
            const bufferToBitIterator = new BytesToBitIterator(buffer);
            const expectedBits: (0 | 1)[] = [
                0, 0, 1, 0, 0, 0, 1, 1,
                0, 1, 0, 0, 0, 1, 0, 1,
                0, 1, 1, 0, 0, 1, 1, 1,
                1, 0, 1, 0, 1, 1, 1, 1
            ];
            let bitResult = bufferToBitIterator.next();
            let index = 0;
            while (!(bitResult.done ?? false)) {
                expect(bitResult.value).to.be.equal(expectedBits[index]);
                bitResult = bufferToBitIterator.next();
                index += 1;
            }
        });
    });

    describe('RandomBitIterator', () => {
        it('random bits', () => {
            const randomBitIterator = new RandomBitIterator(Uint8Array.from([0x1e, 0x33, 0x43, 0xe0, 0x25, 0x3a, 0xb5, 0xa0, 0xf9, 0x0d, 0x33, 0x95, 0x10, 0xaa, 0x7d, 0xee]));
            const expectedBits = [
                1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0,
                0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1
            ];
            for (const expectedBit of expectedBits) 
                expect(randomBitIterator.next().value).to.be.equal(expectedBit);            
        });
    });

    describe('CombineIterator', () => {
        it('combine 1', () => {
            const iterator1 = [1, 2, 3][Symbol.iterator]();
            const iterator2 = [4, 5, 6][Symbol.iterator]();
            const combineIterator = new CombineIterator(iterator1, iterator2, (e1, e2) => [e1, e2] as [number, number]);
            const expectedData: [number, number][] = [[1, 4], [2, 5], [3, 6]];
            for (const expected of expectedData) 
                expect(combineIterator.next().value).to.be.deep.equal(expected);            
        });

        it('combine 1', () => {
            const iterator1 = [1, 2][Symbol.iterator]();
            const iterator2 = [4, 5, 6][Symbol.iterator]();
            const combineIterator = new CombineIterator(iterator1, iterator2, (e1, e2) => [e1, e2] as [number, number]);
            const expectedData: [number, number][] = [[1, 4], [2, 5]];
            for (const expected of expectedData) 
                expect(combineIterator.next().value).to.be.deep.equal(expected);            
        });

        it('combine 1', () => {
            const iterator1 = [1, 2, 3][Symbol.iterator]();
            const iterator2 = [4, 5][Symbol.iterator]();
            const combineIterator = new CombineIterator(iterator1, iterator2, (e1, e2) => [e1, e2] as [number, number]);
            const expectedData: [number, number][] = [[1, 4], [2, 5]];
            for (const expected of expectedData) 
                expect(combineIterator.next().value).to.be.deep.equal(expected);            
        });
    });

    describe('Crypter', () => {
        const cryptionKeys: Crypter.Keys = {
            encryptionKey: new FixedLength(Uint8Array.from([0x37, 0xe6, 0x91, 0x57, 0xda, 0xc0, 0x1c, 0x0a, 0x9c, 0x93, 0xea, 0x1c, 0x72, 0x10, 0x41, 0xe6, 0x26, 0x86, 0x94, 0x3f, 0xda, 0x9d, 0xab, 0x30, 0xf7, 0x56, 0x5e, 0xdb, 0x3e, 0xf1, 0x5f, 0x5b]), 32),
            initialisationVector: new FixedLength(Uint8Array.from([0x69, 0x29, 0xd3, 0xdc, 0x8d, 0xd4, 0x1c, 0x90, 0x81, 0x2e, 0x30, 0x2a, 0x4b, 0x01, 0x03, 0x78]), 16),
            vernamKey: new FixedLength(Uint8Array.from([0x9f, 0x10, 0x2b, 0x4b, 0x5f, 0x0b, 0x5c, 0x50, 0x82, 0xd2, 0xa7, 0xbb, 0x7c, 0x7f, 0x13, 0x9f, 0xed, 0x6a, 0x99, 0x5e, 0xcf, 0x1f, 0x28, 0x80, 0x94, 0x20, 0x3c, 0xc3, 0x92, 0xf9, 0x6b, 0x5e]), 32)
        };
        const crypter = new Crypter(cryptionKeys);

        it('aes encrypt', () => {
            const originalBytes = Uint8Array.from(crypterTestData.aesOriginal);
            const encryptedBytes = crypter.encryptAes(originalBytes);
            const expectedEncryptedBytes = Uint8Array.from(crypterTestData.aesEncrypted);
            expect(encryptedBytes).to.be.deep.equal(expectedEncryptedBytes);
        });

        it('aes decrypt', () => {
            const encryptedBytes = Uint8Array.from(crypterTestData.aesEncrypted);
            const originalBytes = crypter.decryptAes(encryptedBytes);
            const expectedOriginalBytes = Uint8Array.from(crypterTestData.aesOriginal);
            expect(originalBytes).to.be.deep.equal(expectedOriginalBytes);
        });

        it('aes encrypt and decrypt', () => {
            const originalBytes = Uint8Array.from(crypterTestData.aesOriginal);
            const encryptedBytes = crypter.encryptAes(originalBytes);
            const decryptedBytes = crypter.decryptAes(encryptedBytes);
            expect(decryptedBytes).to.be.deep.equal(originalBytes);            
        });

        it('vernam decrypt', () => {
            const encryptedBytes = Uint8Array.from(crypterTestData.vernamEncrypted);
            const originalBytes = crypter.decryptVernamCipher(encryptedBytes);
            const expectedOriginalBytes = Uint8Array.from(crypterTestData.vernamOriginal);
            expect(originalBytes).to.be.deep.equal(expectedOriginalBytes);
        });

        it('vernam encrypt and decrypt', () => {
            const originalBytes = Uint8Array.from(crypterTestData.vernamOriginal);
            const encryptedBytes = crypter.encryptVernamCipher(originalBytes);
            const decryptedBytes = crypter.decryptVernamCipher(encryptedBytes);
            expect(decryptedBytes).to.be.deep.equal(originalBytes);            
        });

        it('aes vernam decrypt', () => {
            const encryptedBytes = Uint8Array.from(crypterTestData.aesVernamEncrypted);
            const originalBytes = crypter.decryptAesAndVernam(encryptedBytes);
            const expectedOriginalBytes = Uint8Array.from(crypterTestData.aesVernamOriginal);
            expect(originalBytes).to.be.deep.equal(expectedOriginalBytes);
        });

        it('aes vernam encrypt and decrypt', () => {
            const originalBytes = Uint8Array.from(crypterTestData.aesVernamOriginal);
            const encryptedBytes = crypter.encryptVernamAndAes(originalBytes);
            const decryptedBytes = crypter.decryptAesAndVernam(encryptedBytes);
            expect(decryptedBytes).to.be.deep.equal(originalBytes);            
        });

        it('decrypt decode', () => {
            const encrypted = unishortString(Uint8Array.from(crypterTestData.encodedEncrypted));
            const decrypted = crypter.decryptDecode(encrypted);
            expect(decrypted).to.be.equal(crypterTestData.decryptedDecoded);
        });

        it('decrypt decode and encode encrypt', () => {
            const encrypted = crypter.encodeEncrypt(crypterTestData.decryptedDecoded);
            const decrypted = crypter.decryptDecode(encrypted);
            expect(decrypted).to.be.equal(crypterTestData.decryptedDecoded);
        });

        it('decrypt decode emtpy string', () => {
            expect(crypter.decryptDecode('')).to.be.deep.equal({});
        });
    });

    describe('FixedLength', () => {
        it('length 16 valid', () => {
            expect(new FixedLength('abcdefghijklmnop', 16).value).to.be.equal('abcdefghijklmnop');
        });

        it('length 16 not length 16', () => {
            try {
                new FixedLength('a', 16);
            } catch (error: any) {
                expect(error.message).to.be.equal('Expected value to has length 16.');
                return;
            }
            expect.fail('Expect throw');
        });
    });

    it('padding', () => {
        for (let i = 0; i < 16; i++) {
            const original = new Uint8Array(32 + i);
            const withPadding = addPadding(original);
            expect(withPadding.length % 16).to.be.deep.equal(0);
            const withoutPadding = removePadding(withPadding);
            expect(withoutPadding).to.be.deep.equal(original);
        }
    });

    it('hash', () => {
        expect(sha512.base64('lkjdasflnc')).to.be.equal('rbswGhojGpzw7EoB61dz3LpecUiFV7y0QHhO7xLHbgtPHhjsKxH6nbUg2p6B5CpSAa1hMzJKBfM8twldRbKj1g');
    });
});
