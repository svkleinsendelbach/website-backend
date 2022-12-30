import { AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkPrerequirements } from '../utils/checkPrerequirements';
import { DatabaseType } from '../classes/DatabaseType';
import { FiatShamirParameters } from '../utils/fiatShamir';
import { FirebaseFunction } from '../utils/FirebaseFunction';
import { Logger } from '../utils/Logger';
import { ParameterContainer } from '../utils/Parameter/ParameterContainer';
import { ParameterParser } from '../utils/Parameter/ParameterParser';
import { EditType } from '../classes/EditType';
import { ParameterBuilder } from '../utils/Parameter/ParameterBuilder';

export class EditEventsFunction implements FirebaseFunction<
    EditEventsFunction.Parameters,
    EditEventsFunction.ReturnType
> {

    public parameters: EditEventsFunction.Parameters;

    private logger: Logger;

    public constructor(data: any, private auth: AuthData | undefined) {
        this.logger = Logger.start(!!data.verbose, 'EditEventsFunction.constructor', { data, auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, this.logger.nextIndent);
        const parameterParser = new ParameterParser<EditEventsFunction.Parameters>(
            {
                fiatShamirParameters: ParameterBuilder.builder('object', FiatShamirParameters.fromObject),
                databaseType: ParameterBuilder.builder('string', DatabaseType.fromString),
                editType: ParameterBuilder.builder('string', EditType.fromString)
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<EditEventsFunction.ReturnType> {
        this.logger.append('EditEventsFunction.executeFunction', {}, 'info');
        await checkPrerequirements(this.parameters, this.logger.nextIndent, this.auth); 
    }
}

export namespace EditEventsFunction {
    export type Parameters = FirebaseFunction.DefaultParameters & {
        editType: EditType
    }

    export type ReturnType = void;
}
