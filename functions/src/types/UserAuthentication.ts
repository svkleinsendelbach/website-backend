export type UserAuthenticationType = 'editEvents' | 'editNews' | 'authenticateUser';

export namespace UserAuthenticationType {
    export function typeGuard(value: string): value is UserAuthenticationType {
        return ['editEvents', 'editNews', 'authenticateUser'].includes(value);
    }
}

export type UserAuthentication = {
    state: 'authenticated' | 'unauthenticated';
    firstName: string;
    lastName: string;
};
