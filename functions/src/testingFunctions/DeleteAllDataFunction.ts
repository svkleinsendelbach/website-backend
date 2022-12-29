import { AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkPrerequirements } from '../utils/checkPrerequirements';
import { DatabaseType } from '../utils/DatabaseType';
import { FiatShamirParameters } from '../utils/fiatShamir';
import { FirebaseFunction } from '../utils/FirebaseFunction';
import { Logger } from '../utils/Logger';
import { ParameterContainer } from '../utils/ParameterContainer';
import { ParameterParser } from '../utils/ParameterParser';
import { existsData, httpsError, reference } from '../utils/utils';

export class DeleteAllDataFunction implements FirebaseFunction<
    DeleteAllDataFunction.Parameters,
    DeleteAllDataFunction.ReturnType
> {

    public parameters: DeleteAllDataFunction.Parameters;

    private logger: Logger;

    public constructor(data: any, auth: AuthData | undefined) {
        this.logger = Logger.start(!!data.verbose, 'DeleteAllDataFunction.constructor', { data, auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, this.logger.nextIndent);
        const parameterParser = new ParameterParser<DeleteAllDataFunction.Parameters>(
            {
                fiatShamirParameters: ['object', FiatShamirParameters.fromObject],
                databaseType: ['string', DatabaseType.fromString]
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<DeleteAllDataFunction.ReturnType> {
        this.logger.append('DeleteAllDataFunction.executeFunction', {}, 'info');
        await checkPrerequirements(this.parameters, this.logger.nextIndent, 'notRequired');
        if (this.parameters.databaseType.value !== 'testing')
            throw httpsError('failed-precondition', 'Function can only be called for testing.', this.logger);
        const ref = reference('', this.parameters.databaseType, this.logger.nextIndent);
        if (await existsData(ref))
            ref.remove();
    }
}

export namespace DeleteAllDataFunction {
    export type Parameters = FirebaseFunction.DefaultParameters;

    export type ReturnType = void;
}
