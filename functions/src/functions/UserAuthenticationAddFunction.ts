import { DatabaseType, type FirebaseFunction, Logger, ParameterBuilder, ParameterContainer, ParameterParser, VerboseType, Crypter, DatabaseReference } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkPrerequirements } from '../checkPrerequirements';
import { type DatabaseScheme } from '../DatabaseScheme';
import { getCryptionKeys, getDatabaseUrl } from '../privateKeys';
import { UserAuthenticationType } from '../types/UserAuthentication';

export class UserAuthenticationAddFunction implements FirebaseFunction<UserAuthenticationAddFunction.Parameters, UserAuthenticationAddFunction.ReturnType> {
    public readonly parameters: UserAuthenticationAddFunction.Parameters;

    private readonly logger: Logger;

    public constructor(data: unknown, private readonly auth: AuthData | undefined) {
        this.logger = Logger.start(VerboseType.getFromObject(data), 'UserAuthenticationAddFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getCryptionKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<UserAuthenticationAddFunction.Parameters>(
            {
                databaseType: ParameterBuilder.build('string', DatabaseType.fromString),
                type: ParameterBuilder.guard('string', UserAuthenticationType.typeGuard),
                firstName: ParameterBuilder.value('string'),
                lastName: ParameterBuilder.value('string')
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<UserAuthenticationAddFunction.ReturnType> {
        this.logger.log('UserAuthenticationAddFunction.executeFunction', {}, 'info');
        await checkPrerequirements(this.parameters, this.logger.nextIndent, this.auth);
        const hashedUserId = this.auth === undefined ? '' : Crypter.sha512(this.auth.uid);
        const reference = DatabaseReference.base<DatabaseScheme>(getDatabaseUrl(this.parameters.databaseType), getCryptionKeys(this.parameters.databaseType)).child('users').child('authentication').child(this.parameters.type).child(hashedUserId);
        await reference.set({
            state: 'unauthenticated',
            firstName: this.parameters.firstName,
            lastName: this.parameters.lastName
        }, true);
    }
}

export namespace UserAuthenticationAddFunction {
    export type Parameters = {
        databaseType: DatabaseType;
        type: UserAuthenticationType;
        firstName: string;
        lastName: string;
    };

    export namespace Parameters {
        export type Flatten = {
            databaseType: DatabaseType.Value;
            type: UserAuthenticationType;
            firstName: string;
            lastName: string;
        };
    }

    export type ReturnType = void;
}
