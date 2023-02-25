import { DatabaseType, type FirebaseFunction, Logger, ParameterBuilder, ParameterContainer, ParameterParser, VerboseType, HttpsError, DatabaseReference, Crypter } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkPrerequirements } from '../checkPrerequirements';
import { type DatabaseScheme } from '../DatabaseScheme';
import { getCryptionKeys, getDatabaseUrl } from '../privateKeys';
import { UserAuthenticationType } from '../types/UserAuthentication';

export class UserAuthenticationCheckFunction implements FirebaseFunction<UserAuthenticationCheckFunction.Parameters, UserAuthenticationCheckFunction.ReturnType> {
    public readonly parameters: UserAuthenticationCheckFunction.Parameters;

    private readonly logger: Logger;

    public constructor(data: unknown, private readonly auth: AuthData | undefined) {
        this.logger = Logger.start(VerboseType.getFromObject(data), 'UserAuthenticationCheckFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getCryptionKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<UserAuthenticationCheckFunction.Parameters>(
            {
                databaseType: ParameterBuilder.build('string', DatabaseType.fromString),
                type: ParameterBuilder.guard('string', UserAuthenticationType.typeGuard)
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<UserAuthenticationCheckFunction.ReturnType> {
        this.logger.log('UserAuthenticationCheckFunction.executeFunction', {}, 'info');
        await checkPrerequirements(this.parameters, this.logger.nextIndent, this.auth);
        if (this.auth === undefined)
            throw HttpsError('permission-denied', 'The function must be called while authenticated, nobody signed in.', this.logger);
        const reference = DatabaseReference.base<DatabaseScheme>(getDatabaseUrl(this.parameters.databaseType), getCryptionKeys(this.parameters.databaseType)).child('users').child('authentication').child(this.parameters.type).child(Crypter.sha512(this.auth.uid));
        const snapshot = await reference.snapshot();
        if (!snapshot.exists)
            throw HttpsError('permission-denied', `The function must be called while authenticated, not authenticated for ${this.parameters.type}.`, this.logger);
        if (snapshot.value(true).state === 'unauthenticated')
            throw HttpsError('permission-denied', `The function must be called while authenticated, unauthenticated for ${this.parameters.type}.`, this.logger);
    }
}

export namespace UserAuthenticationCheckFunction {
    export type Parameters = {
        databaseType: DatabaseType;
        type: UserAuthenticationType;
    };

    export namespace Parameters {
        export type Flatten = {
            databaseType: DatabaseType.Value;
            type: UserAuthenticationType;
        };
    }

    export type ReturnType = void;
}
