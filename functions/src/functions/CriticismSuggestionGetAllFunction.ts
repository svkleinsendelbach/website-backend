import { type DatabaseType, type IFirebaseFunction, type ILogger, ParameterParser, type IFunctionType, IParameterContainer, IDatabaseReference, NullableParameterBuilder, ValueParameterBuilder } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { CriticismSuggestion } from '../types/CriticismSuggestion';
import { checkUserRoles } from '../checkUserRoles';
import { DatabaseScheme } from '../DatabaseScheme';

export class CriticismSuggestionGetAllFunction implements IFirebaseFunction<CriticismSuggestionGetAllFunctionType> {
    public readonly parameters: IFunctionType.Parameters<CriticismSuggestionGetAllFunctionType> & { databaseType: DatabaseType };

    public constructor(
        parameterContainer: IParameterContainer, 
        private readonly auth: AuthData | null, 
        private readonly databaseReference: IDatabaseReference<DatabaseScheme>, 
        private readonly logger: ILogger
    ) {
        this.logger.log('CriticismSuggestionGetAllFunction.constructor', { auth: auth }, 'notice');
        const parameterParser = new ParameterParser<IFunctionType.Parameters<CriticismSuggestionGetAllFunctionType>>(
            {
                workedOff: new NullableParameterBuilder(new ValueParameterBuilder('boolean'))
            },
            this.logger.nextIndent
        );
        parameterParser.parse(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async execute(): Promise<IFunctionType.ReturnType<CriticismSuggestionGetAllFunctionType>> {
        this.logger.log('CriticismSuggestionGetAllFunction.executeFunction', {}, 'info');
        await checkUserRoles(this.auth, 'admin', this.databaseReference, this.logger.nextIndent);
        const references = this.databaseReference.child('criticismSuggestions');
        const snapshot = await references.snapshot();
        if (!snapshot.exists || !snapshot.hasChildren)
            return [];
        return snapshot.compactMap(snapshot => {
            if (snapshot.key === null)
                return null;
            const criticismSuggestion = snapshot.value('decrypt');
            if (this.parameters.workedOff === !criticismSuggestion.workedOff)
                return null;
            return {
                ...criticismSuggestion,
                id: snapshot.key
            };
        });
    }
}

export type CriticismSuggestionGetAllFunctionType = IFunctionType<{
    workedOff: boolean | null;
}, Array<CriticismSuggestion.Flatten>>;
