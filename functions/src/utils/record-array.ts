export function recordKeys<T extends Record<string, unknown>>(record: T): (keyof T)[] {
    return Object.keys(record);
}

export function recordValues<T extends Record<string, unknown>>(record: T): T[keyof T][] {
    return Object.values(record) as T[keyof T][];
}

export function recordEntries<T extends Record<string, unknown>>(record: T): { key: keyof T; value: T[keyof T] }[] {
    return (Object.entries(record) as [keyof T, T[keyof T]][])
        .map(entry => ({
            key: entry[0],
            value: entry[1]
        }));
}

export function mapRecord<T extends Record<string, unknown>, U>(record: T, callbackFn: (value: T[keyof T], key: keyof T) => U): Record<keyof T, U> {
    const newRecord = {} as Record<keyof T, U>;
    for (const entry of recordEntries(record))
        newRecord[entry.key] = callbackFn(entry.value, entry.key);
    return newRecord;
}

export type Element<T extends unknown[]> = T extends (infer U) ? U : never;

export function includesAll<T>(array: T[], expectedElements: T[]): boolean {
    for (const expectedElement of expectedElements) {
        if (!array.includes(expectedElement))
            return false;
    }
    return true;
}

export function compactMap<T, U>(array: T[], callbackFn: (value: T, index: number, array: T[]) => U | null | undefined): U[] {
    return array
        .flatMap((value, index, _array) => {
            const mappedValue = callbackFn(value, index, _array);
            if (mappedValue === null || mappedValue === undefined)
                return [];
            return { wrapped: mappedValue };
        })
        .map(value => value.wrapped);
}

export function mapExisting<T, U>(array: (T | null | undefined)[], callbackFn: (value: T, index: number, array: T[]) => U): U[] {
    return compactMap(array, value => value)
        .map(callbackFn);
}
