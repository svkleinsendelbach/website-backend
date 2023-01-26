import { AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkPrerequirements, checkUserAuthentication } from '../utils/checkPrerequirements';
import { DatabaseType } from '../classes/DatabaseType';
import { FiatShamirParameters } from '../classes/FiatShamirParameters';
import { FirebaseFunction } from '../utils/FirebaseFunction';
import { Logger } from '../utils/Logger';
import { ParameterContainer } from '../utils/Parameter/ParameterContainer';
import { ParameterParser } from '../utils/Parameter/ParameterParser';
import { ParameterBuilder } from '../utils/Parameter/ParameterBuilder';
import { FirebaseDatabase } from '../utils/FirebaseDatabase';
import { httpsError } from '../utils/utils';
import { Crypter } from '../crypter/Crypter';
import { cryptionKeys } from '../privateKeys';
import { News } from '../classes/News';

export class DisableNewsFunction implements FirebaseFunction<
    DisableNewsFunction.Parameters,
    DisableNewsFunction.ReturnType
> {

    public parameters: DisableNewsFunction.Parameters;

    private logger: Logger;

    public constructor(data: any, private auth: AuthData | undefined) {
        this.logger = Logger.start(data.verbose, 'DisableNewsFunction.constructor', { data, auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, this.logger.nextIndent);
        const parameterParser = new ParameterParser<DisableNewsFunction.Parameters>(
            {
                fiatShamirParameters: ParameterBuilder.builder('object', FiatShamirParameters.fromObject),
                databaseType: ParameterBuilder.builder('string', DatabaseType.fromString),
                editType: ParameterBuilder.guardBuilder('string', (value: string): value is 'disable' | 'enable' => value === 'disable' || value === 'enable'),
                id: ParameterBuilder.trivialBuilder('string')
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<DisableNewsFunction.ReturnType> {
        this.logger.log('DisableNewsFunction.executeFunction', {}, 'info');
        await checkPrerequirements(this.parameters, this.logger.nextIndent, this.auth); 
        await checkUserAuthentication(this.auth, 'websiteEditing', this.parameters.databaseType, this.logger.nextIndent);

        const reference = FirebaseDatabase.Reference.fromPath(`news/${this.parameters.id}`, this.parameters.databaseType);
        const snapshot = await reference.snapshot<string>();
        if (!snapshot.exists)
            throw httpsError('not-found', 'Couldn\'t find news with specified id.', this.logger);
        const crypter = new Crypter(cryptionKeys(this.parameters.databaseType));
        const news: News.CallParameters = crypter.decryptDecode(snapshot.value);
        news.disabled = this.parameters.editType === 'disable';
        await reference.set(crypter.encodeEncrypt(news));        
    }
}

export namespace DisableNewsFunction {
    export type Parameters = FirebaseFunction.DefaultParameters & {
        editType: 'disable' | 'enable',
        id: string
    }

    export type ReturnType = void;

    export type CallParameters = {
        editType: 'disable' | 'enable',
        id: string
    }
}
