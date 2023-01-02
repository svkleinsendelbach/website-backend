import * as admin from 'firebase-admin';
import { DatabaseType } from '../classes/DatabaseType';
import { ArrayElement, undefinedValuesAsNull } from './utils';

export namespace FirebaseDatabase {
    export type ValueType = ValueType.TrivialType | ValueType[] | {
        [key: string]: ValueType
    }

    export namespace ValueType {        
        export type TrivialType = null | boolean | string | number;
    }

    export class Reference {
        public constructor(
            private readonly reference: admin.database.Reference
        ) {}

        public async snapshot<T>(): Promise<Snapshot<T>> {
            return new Snapshot<T>(await this.reference.once('value'));
        }

        public child(path: string): Reference {
            return new Reference(this.reference.child(path));
        }

        public async set(value: ValueType, onComplete?: (a: Error | null) => void) {
            await this.reference.set(undefinedValuesAsNull(value as any), onComplete);
        }

        public async remove(onComplete?: (a: Error | null) => void) {
            await this.reference.remove(onComplete);
        }
    }

    export namespace Reference {
        export function fromPath(path: string, databaseType: DatabaseType): Reference {
            const reference = admin
                .app()
                .database(databaseType.databaseUrl)
                .ref(path || undefined);
            return new Reference(reference);
        }
    }

    export class Snapshot<T> {
        public constructor(
            private readonly snapshot: admin.database.DataSnapshot
        ) {}

        public get value(): T {
            return this.snapshot.val();
        }

        public hasChild(path: string): boolean {
            return this.snapshot.hasChild(path);
        }

        public get hasChildren(): boolean {
            return this.snapshot.hasChildren();
        }

        public get numberChildren(): number {
            return this.snapshot.numChildren();
        }

        public get key(): string | null {
            return this.snapshot.key;
        }

        public get exists(): boolean {
            return this.snapshot.exists();
        }

        public forEach(action: (a: Snapshot<ArrayElement<T>>) => boolean | void): boolean {
            return this.snapshot.forEach(snapshot => {
                return action(new Snapshot(snapshot));
            });
        }

        public child<Key extends keyof T & string>(path: Key): Snapshot<T[Key]> {
            return new Snapshot(this.snapshot.child(path));
        }
    }
}
