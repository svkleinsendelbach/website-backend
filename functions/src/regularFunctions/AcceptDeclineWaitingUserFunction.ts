import { AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkPrerequirements, checkUserAuthentication, UserAuthentication, UserAuthenticationType } from '../utils/checkPrerequirements';
import { DatabaseType } from '../classes/DatabaseType';
import { FirebaseFunction } from '../utils/FirebaseFunction';
import { Logger } from '../utils/Logger';
import { ParameterContainer } from '../utils/Parameter/ParameterContainer';
import { ParameterParser } from '../utils/Parameter/ParameterParser';
import { ParameterBuilder } from '../utils/Parameter/ParameterBuilder';
import { FirebaseDatabase } from '../utils/FirebaseDatabase';
import { Crypter } from '../crypter/Crypter';
import { cryptionKeys } from '../privateKeys';
import { FiatShamirParameters } from '../classes/FiatShamirParameters';

export class AcceptDeclineWaitingUserFunction implements FirebaseFunction<
    AcceptDeclineWaitingUserFunction.Parameters,
    AcceptDeclineWaitingUserFunction.ReturnType
> {

    public parameters: AcceptDeclineWaitingUserFunction.Parameters;

    private logger: Logger;

    public constructor(data: any, private auth: AuthData | undefined) {
        this.logger = Logger.start(!!data.verbose, 'AcceptDeclineWaitingUserFunction.constructor', { data, auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, this.logger.nextIndent);
        const parameterParser = new ParameterParser<AcceptDeclineWaitingUserFunction.Parameters>(
            {
                fiatShamirParameters: ParameterBuilder.builder('object', FiatShamirParameters.fromObject),
                databaseType: ParameterBuilder.builder('string', DatabaseType.fromString),
                type: ParameterBuilder.guardBuilder('string', UserAuthenticationType.isValid),
                hashedUserId: ParameterBuilder.trivialBuilder('string'),
                action: ParameterBuilder.guardBuilder('string', (value: string): value is 'accept' | 'decline' => value === 'accept' || value === 'decline')
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<AcceptDeclineWaitingUserFunction.ReturnType> {
        this.logger.log('AcceptDeclineWaitingUserFunction.executeFunction', {}, 'info');
        await checkPrerequirements(this.parameters, this.logger.nextIndent, this.auth); 
        await checkUserAuthentication(this.auth, 'websiteEditing', this.parameters.databaseType, this.logger.nextIndent);

        const reference = FirebaseDatabase.Reference.fromPath(`users/authentication/${this.parameters.type}/${this.parameters.hashedUserId}`, this.parameters.databaseType);
        const snapshot = await reference.snapshot<string>();
        if (! snapshot.exists) return;
        const crypter = new Crypter(cryptionKeys(this.parameters.databaseType));
        const userAuthentication: UserAuthentication = crypter.decryptDecode(snapshot.value);
        if (userAuthentication.state === 'authenticated') return;
        if (this.parameters.action === 'accept') {
            userAuthentication.state = 'authenticated';
            await reference.set(crypter.encodeEncrypt(userAuthentication));
        } else
            await reference.remove();
    }
}

export namespace AcceptDeclineWaitingUserFunction {
    export type Parameters = FirebaseFunction.DefaultParameters & {
        type: UserAuthenticationType,
        hashedUserId: string,
        action: 'accept' | 'decline'
    }

    export type ReturnType = void;

    export type CallParameters = {
        type: UserAuthenticationType,
        hashedUserId: string,
        action: 'accept' | 'decline'
    }
}
