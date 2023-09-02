export type UserAuthenticationType = 'editEvents' | 'editReports' | 'authenticateUser' | 'notification';

export namespace UserAuthenticationType {
    export function typeGuard(value: string): value is UserAuthenticationType {
        return ['editEvents', 'editReports', 'authenticateUser', 'notification'].includes(value);
    }
}

export type UserAuthentication = {
    state: 'authenticated' | 'unauthenticated';
    firstName: string;
    lastName: string;
};
