export class FixedLength<T extends { length: number }, Length extends number> {
    public constructor(
        public readonly value: T,
        length: Length
    ) {
        if (value.length !== length)
            throw new Error(`Expected value to has length ${length}.`);
    }
}
