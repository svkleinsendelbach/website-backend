import { DatabaseReference, DatabaseType } from "firebase-function";
import { DatabaseScheme } from "./DatabaseScheme";
import { getPrivateKeys } from "./privateKeys";

export function uniqueKeyedList<T>(list: T[], makeKey: (element: T) => PropertyKey): T[] {
    const uniqueKeyElementList: Record<PropertyKey, T> = {};
    for (const element of list)
        uniqueKeyElementList[makeKey(element)] = element;
    return Object.values(uniqueKeyElementList);
}

export function baseDatabaseReference(databaseType: DatabaseType): DatabaseReference<DatabaseScheme> {
    return DatabaseReference.base<DatabaseScheme>(getPrivateKeys(databaseType));
}