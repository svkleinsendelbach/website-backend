export function uniqueKeyedList<T>(list: T[], makeKey: (element: T) => PropertyKey): T[] {
    const uniqueKeyElementList: Record<PropertyKey, T> = {};
    for (const element of list)
        uniqueKeyElementList[makeKey(element)] = element;
    return Object.values(uniqueKeyElementList);
}
