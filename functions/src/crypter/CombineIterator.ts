export class CombineIterator<T1, T2, R> implements Iterator<R, undefined> {
    public constructor(
        private readonly iterator1: Iterator<T1>,
        private readonly iterator2: Iterator<T2>,
        private readonly combineElement: (element1: T1, element2: T2) => R
    ) {}

    public next(): IteratorResult<R, undefined> {
        const element1 = this.iterator1.next();
        const element2 = this.iterator2.next();
        if ((element1.done ?? false) || (element2.done ?? false))
            return { done: true, value: undefined };
        return {
            value: this.combineElement(element1.value, element2.value)
        };
    }
}
