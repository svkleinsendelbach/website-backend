import { AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkPrerequirements } from '../utils/checkPrerequirements';
import { DatabaseType } from '../classes/DatabaseType';
import { FirebaseFunction } from '../utils/FirebaseFunction';
import { Logger } from '../utils/Logger';
import { ParameterContainer } from '../utils/Parameter/ParameterContainer';
import { ParameterParser } from '../utils/Parameter/ParameterParser';
import { httpsError } from '../utils/utils';
import { ParameterBuilder } from '../utils/Parameter/ParameterBuilder';
import { FirebaseDatabase } from '../utils/FirebaseDatabase';
import { FiatShamirParameters } from '../classes/FiatShamirParameters';

export class DeleteAllDataFunction implements FirebaseFunction<
    DeleteAllDataFunction.Parameters,
    DeleteAllDataFunction.ReturnType
> {

    public parameters: DeleteAllDataFunction.Parameters;

    private logger: Logger;

    public constructor(data: any, auth: AuthData | undefined) {
        this.logger = Logger.start(data.verbose, 'DeleteAllDataFunction.constructor', { data, auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, this.logger.nextIndent);
        const parameterParser = new ParameterParser<DeleteAllDataFunction.Parameters>(
            {
                fiatShamirParameters: ParameterBuilder.builder('object', FiatShamirParameters.fromObject),
                databaseType: ParameterBuilder.builder('string', DatabaseType.fromString)
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<DeleteAllDataFunction.ReturnType> {
        this.logger.log('DeleteAllDataFunction.executeFunction', {}, 'info');
        await checkPrerequirements(this.parameters, this.logger.nextIndent, 'notRequired');
        if (this.parameters.databaseType.value !== 'testing')
            throw httpsError('failed-precondition', 'Function can only be called for testing.', this.logger);
        const reference = FirebaseDatabase.Reference.fromPath('', this.parameters.databaseType);
        const snapshot = await reference.snapshot();
        if (snapshot.exists)
            reference.remove();
    }
}

export namespace DeleteAllDataFunction {
    export type Parameters = FirebaseFunction.DefaultParameters;

    export type ReturnType = void;

    export type CallParameters = Record<string, never>;
}
