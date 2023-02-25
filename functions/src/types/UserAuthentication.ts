export type UserAuthenticationType = 'websiteEditing';

export namespace UserAuthenticationType {
    export function typeGuard(value: string): value is UserAuthenticationType {
        return ['websiteEditing'].includes(value);
    }
}

export type UserAuthentication = {
    state: 'authenticated' | 'unauthenticated';
    firstName: string;
    lastName: string;
};
