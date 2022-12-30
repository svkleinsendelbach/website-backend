import { AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkPrerequirements, UserAuthenticationType } from '../utils/checkPrerequirements';
import { DatabaseType } from '../classes/DatabaseType';
import { FiatShamirParameters } from '../utils/fiatShamir';
import { FirebaseFunction } from '../utils/FirebaseFunction';
import { Logger } from '../utils/Logger';
import { ParameterContainer } from '../utils/Parameter/ParameterContainer';
import { ParameterParser } from '../utils/Parameter/ParameterParser';
import { ParameterBuilder } from '../utils/Parameter/ParameterBuilder';
import { Crypter } from '../crypter/Crypter';
import { FirebaseDatabase } from '../utils/FirebaseDatabase';

export class AddUserForWaitingFunction implements FirebaseFunction<
    AddUserForWaitingFunction.Parameters,
    AddUserForWaitingFunction.ReturnType
> {

    public parameters: AddUserForWaitingFunction.Parameters;

    private logger: Logger;

    public constructor(data: any, private auth: AuthData | undefined) {
        this.logger = Logger.start(!!data.verbose, 'AddUserForWaitingFunction.constructor', { data, auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, this.logger.nextIndent);
        const parameterParser = new ParameterParser<AddUserForWaitingFunction.Parameters>(
            {
                fiatShamirParameters: ParameterBuilder.builder('object', FiatShamirParameters.fromObject),
                databaseType: ParameterBuilder.builder('string', DatabaseType.fromString),
                type: ParameterBuilder.guardBuilder('string', UserAuthenticationType.isValid),
                firstName: ParameterBuilder.trivialBuilder('string'),
                lastName: ParameterBuilder.trivialBuilder('string')
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<AddUserForWaitingFunction.ReturnType> {
        this.logger.log('AddUserForWaitingFunction.executeFunction', {}, 'info');
        await checkPrerequirements(this.parameters, this.logger.nextIndent, this.auth); 
        
        const hashedUserId = Crypter.sha512(this.auth!.uid);
        const reference = FirebaseDatabase.Reference.fromPath(`users/authentication/${this.parameters.type}/${hashedUserId}`, this.parameters.databaseType); 
        await reference.set({
            state: 'unauthenticated',
            firstName: this.parameters.firstName,
            lastName: this.parameters.lastName
        });
    }
}

export namespace AddUserForWaitingFunction {
    export type Parameters = FirebaseFunction.DefaultParameters & {
        type: UserAuthenticationType,
        firstName: string,
        lastName: string
    }

    export type ReturnType = void;
}
