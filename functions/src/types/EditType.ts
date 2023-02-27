export type EditType = 'add' | 'change' | 'remove';

export namespace EditType {
    export function typeGuard(value: string): value is EditType {
        return ['add', 'change', 'remove'].includes(value);
    }
}
