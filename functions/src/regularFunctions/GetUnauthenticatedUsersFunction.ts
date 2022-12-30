import { AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkPrerequirements, checkUserAuthentication, UserAuthentication, UserAuthenticationType } from '../utils/checkPrerequirements';
import { DatabaseType } from '../classes/DatabaseType';
import { FiatShamirParameters } from '../utils/fiatShamir';
import { FirebaseFunction } from '../utils/FirebaseFunction';
import { Logger } from '../utils/Logger';
import { ParameterContainer } from '../utils/Parameter/ParameterContainer';
import { ParameterParser } from '../utils/Parameter/ParameterParser';
import { ParameterBuilder } from '../utils/Parameter/ParameterBuilder';
import { FirebaseDatabase } from '../utils/FirebaseDatabase';
import { Crypter } from '../crypter/Crypter';
import { cryptionKeys } from '../privateKeys';

export class GetUnauthenticatedUsersFunction implements FirebaseFunction<
    GetUnauthenticatedUsersFunction.Parameters,
    GetUnauthenticatedUsersFunction.ReturnType
> {

    public parameters: GetUnauthenticatedUsersFunction.Parameters;

    private logger: Logger;

    public constructor(data: any, private auth: AuthData | undefined) {
        this.logger = Logger.start(!!data.verbose, 'GetUnauthenticatedUsersFunction.constructor', { data, auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, this.logger.nextIndent);
        const parameterParser = new ParameterParser<GetUnauthenticatedUsersFunction.Parameters>(
            {
                fiatShamirParameters: ParameterBuilder.builder('object', FiatShamirParameters.fromObject),
                databaseType: ParameterBuilder.builder('string', DatabaseType.fromString),
                type: ParameterBuilder.guardBuilder('string', UserAuthenticationType.isValid)
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<GetUnauthenticatedUsersFunction.ReturnType> {
        this.logger.log('GetUnauthenticatedUsersFunction.executeFunction', {}, 'info');
        await checkPrerequirements(this.parameters, this.logger.nextIndent, this.auth); 
        await checkUserAuthentication(this.auth, this.parameters.type, this.parameters.databaseType, this.logger.nextIndent);
        const crypter = new Crypter(cryptionKeys(this.parameters.databaseType));
        const reference = FirebaseDatabase.Reference.fromPath(`users/authentication/${this.parameters.type}`, this.parameters.databaseType);
        const snapshot = await reference.snapshot<{ [key: string]: string }>();
        return Object
            .entries(snapshot.value)
            .map(entry => {
                const userAuthentication: UserAuthentication = crypter.decryptDecode(entry[1]);
                return {
                    hashedUserId: entry[0],
                    firstName: userAuthentication.firstName,
                    lastName: userAuthentication.lastName
                };
            });
    }
}

export namespace GetUnauthenticatedUsersFunction {
    export type Parameters = FirebaseFunction.DefaultParameters & {
        type: UserAuthenticationType
    }

    export type ReturnType = {
        hashedUserId: string,
        firstName: string,
        lastName: string
    }[];
}
