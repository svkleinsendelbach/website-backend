import { type DatabaseType, type IFirebaseFunction, HttpsError, ParameterParser, type ILogger, type IFunctionType, IDatabaseReference, IParameterContainer } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { DatabaseScheme } from '../DatabaseScheme';

export class DeleteAllDataFunction implements IFirebaseFunction<DeleteAllDataFunctionType> {
    public readonly parameters: IFunctionType.Parameters<DeleteAllDataFunctionType> & { databaseType: DatabaseType };

    public constructor(
        parameterContainer: IParameterContainer, 
        auth: AuthData | null, 
        private readonly databaseReference: IDatabaseReference<DatabaseScheme>, 
        private readonly logger: ILogger
    ) {
        this.logger.log('DeleteAllDataFunction.constructor', { auth: auth }, 'notice');
        const parameterParser = new ParameterParser<IFunctionType.Parameters<DeleteAllDataFunctionType>>({}, this.logger.nextIndent);
        parameterParser.parse(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async execute(): Promise<IFunctionType.ReturnType<DeleteAllDataFunctionType>> {
        this.logger.log('DeleteAllDataFunction.executeFunction', {}, 'info');
        if (this.parameters.databaseType.value !== 'testing')
            throw HttpsError('failed-precondition', 'Function can only be called for testing.', this.logger);
        await this.databaseReference.remove();
    }
}

export type DeleteAllDataFunctionType = IFunctionType<Record<string, never>, void>;
