import { bits } from './utils';

export class BytesToBitIterator implements Iterator<0 | 1, undefined> {
    private bytesIterator: Iterator<number, undefined>;

    private currentBitsIterator: Iterator<0 | 1, undefined> | undefined;

    public constructor(bytes: Uint8Array) {
        this.bytesIterator = bytes[Symbol.iterator]();
        const bytesIteratorResult = this.bytesIterator.next();
        if (!(bytesIteratorResult.done ?? false))
            this.currentBitsIterator = bits(bytesIteratorResult.value)[Symbol.iterator]();
    }

    public next(): IteratorResult<0 | 1, undefined> {
        if (this.currentBitsIterator === undefined)
            return { done: true, value: undefined };
        const currentBitsIteratorResult = this.currentBitsIterator.next();
        if (!(currentBitsIteratorResult.done ?? false))
            return { value: currentBitsIteratorResult.value };
        const bytesIteratorResult = this.bytesIterator.next();
        if (!(bytesIteratorResult.done ?? false))
            this.currentBitsIterator = bits(bytesIteratorResult.value)[Symbol.iterator]();
        else
            this.currentBitsIterator = undefined;
        return this.next();
    }
}
