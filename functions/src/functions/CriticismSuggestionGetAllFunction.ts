import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, type FunctionType } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { getPrivateKeys } from '../privateKeys';
import { CriticismSuggestion } from '../types/CriticismSuggestion';
import { checkUserRoles } from '../checkUserRoles';
import { DatabaseScheme } from '../DatabaseScheme';

export class CriticismSuggestionGetAllFunction implements FirebaseFunction<CriticismSuggestionGetAllFunctionType> {
    public readonly parameters: FunctionType.Parameters<CriticismSuggestionGetAllFunctionType> & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, private readonly auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('CriticismSuggestionGetAllFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getPrivateKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<FunctionType.Parameters<CriticismSuggestionGetAllFunctionType>>(
            {
                workedOff: ParameterBuilder.nullable(ParameterBuilder.value('boolean'))
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<CriticismSuggestionGetAllFunctionType>> {
        this.logger.log('CriticismSuggestionGetAllFunction.executeFunction', {}, 'info');
        await checkUserRoles(this.auth, 'admin', this.parameters.databaseType, this.logger.nextIndent);
        const references = DatabaseScheme.reference(this.parameters.databaseType).child('criticismSuggestions');
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

export type CriticismSuggestionGetAllFunctionType = FunctionType<{
    workedOff: boolean | null;
}, Array<CriticismSuggestion.Flatten>>;
