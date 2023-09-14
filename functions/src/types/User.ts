export type User = {
    firstName: string;
    lastName: string;
    hashedUserId: string;
    roles: User.Role[] | 'unauthenticated';
};

export namespace User {
    export type Role = 'admin' | 'websiteManager' | 'occupancyManager';

    export namespace Role {
        export const all: Role[] = ['admin', 'websiteManager', 'occupancyManager'];

        export function typeGuard(value: string): value is Role {
            return (Role.all as string[]).includes(value);
        }
    }
}
