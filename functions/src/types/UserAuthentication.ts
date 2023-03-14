export type UserAuthenticationType = 'editEvents' | 'editNews' | 'editReports' | 'authenticateUser' | 'notification';

export namespace UserAuthenticationType {
    export function typeGuard(value: string): value is UserAuthenticationType {
        return ['editEvents', 'editNews', 'editReports', 'authenticateUser', 'notification'].includes(value);
    }
}

export type UserAuthentication = {
    state: 'authenticated' | 'unauthenticated';
    firstName: string;
    lastName: string;
};
