export type UserAuthenticationType = 'editEvents' | 'editNews' | 'editReports' | 'authenticateUser';

export namespace UserAuthenticationType {
    export function typeGuard(value: string): value is UserAuthenticationType {
        return ['editEvents', 'editNews', 'editReports', 'authenticateUser'].includes(value);
    }
}

export type UserAuthentication = {
    state: 'authenticated' | 'unauthenticated';
    firstName: string;
    lastName: string;
};
