export type UserAuthenticationType = 'editEvents' | 'editReports' | 'authenticateUser' | 'notification' | 'editOccupancy';

export namespace UserAuthenticationType {
    export function typeGuard(value: string): value is UserAuthenticationType {
        return ['editEvents', 'editReports', 'authenticateUser', 'notification', 'editOccupancy'].includes(value);
    }
}

export type UserAuthentication = {
    state: 'authenticated' | 'unauthenticated';
    firstName: string;
    lastName: string;
};
