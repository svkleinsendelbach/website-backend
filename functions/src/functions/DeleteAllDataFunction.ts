import { DatabaseReference, DatabaseType, type FirebaseFunction, HttpsError, Logger, ParameterBuilder, ParameterContainer, ParameterParser, VerboseType } from 'firebase-function';
import { getCryptionKeys, getDatabaseUrl } from '../privateKeys';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { type DatabaseScheme } from '../DatabaseScheme';
import { checkPrerequirements } from '../checkPrerequirements';

export class DeleteAllDataFunction implements FirebaseFunction<DeleteAllDataFunction.Parameters, DeleteAllDataFunction.ReturnType> {
    public readonly parameters: DeleteAllDataFunction.Parameters;

    private readonly logger: Logger;

    public constructor(data: unknown, auth: AuthData | undefined) {
        this.logger = Logger.start(VerboseType.getFromObject(data), 'DeleteAllDataFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getCryptionKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<DeleteAllDataFunction.Parameters>(
            {
                databaseType: ParameterBuilder.build('string', DatabaseType.fromString)
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
            throw HttpsError('failed-precondition', 'Function can only be called for testing.', this.logger);
        const reference = DatabaseReference.base<DatabaseScheme>(getDatabaseUrl(this.parameters.databaseType), getCryptionKeys(this.parameters.databaseType));
        await reference.remove();
    }
}

export namespace DeleteAllDataFunction {
    export type Parameters = {
        databaseType: DatabaseType;
    };

    export namespace Parameters {
        export type Flatten = {
            databaseType: DatabaseType.Value;
        };
    }

    export type ReturnType = void;
}
