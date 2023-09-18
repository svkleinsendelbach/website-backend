import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, type FunctionType, HttpsError } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { getPrivateKeys } from '../privateKeys';
import { EditType } from '../types/EditType';
import { Guid } from '../types/Guid';
import { CriticismSuggestion } from '../types/CriticismSuggestion';
import { checkUserRoles } from '../checkUserRoles';
import { DatabaseScheme } from '../DatabaseScheme';

export class CriticismSuggestionEditFunction implements FirebaseFunction<CriticismSuggestionEditFunctionType> {
    public readonly parameters: FunctionType.Parameters<CriticismSuggestionEditFunctionType> & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, private readonly auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('CriticismSuggestionEditFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getPrivateKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<FunctionType.Parameters<CriticismSuggestionEditFunctionType>>(
            {
                editType: ParameterBuilder.guard('string', EditType.typeGuard),
                criticismSuggestionId: ParameterBuilder.build('string', Guid.fromString),
                criticismSuggestion: ParameterBuilder.nullable(ParameterBuilder.build('object', CriticismSuggestion.fromObject))
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<CriticismSuggestionEditFunctionType>> {
        this.logger.log('CriticismSuggestionEditFunction.executeFunction', {}, 'info');
        if (this.parameters.editType !== 'add')
            await checkUserRoles(this.auth, 'admin', this.parameters.databaseType, this.logger.nextIndent);
        const reference = DatabaseScheme.reference(this.parameters.databaseType).child('criticismSuggestions').child(this.parameters.criticismSuggestionId.guidString);
        const snapshot = await reference.snapshot();
        if (this.parameters.editType === 'remove') {
            if (snapshot.exists)
                await reference.remove();
        } else {
            if (!this.parameters.criticismSuggestion)
                throw HttpsError('invalid-argument', 'No criticism suggestion in parameters to add / change.', this.logger);
            if (this.parameters.editType === 'add' && snapshot.exists)
                throw HttpsError('invalid-argument', 'Couldn\'t add existing criticism suggestion.', this.logger);
            if (this.parameters.editType === 'change' && !snapshot.exists)
                throw HttpsError('invalid-argument', 'Couldn\'t change not existing criticism suggestion.', this.logger);
            await reference.set(CriticismSuggestion.flatten(this.parameters.criticismSuggestion), 'encrypt');
        }
    }
}

export type CriticismSuggestionEditFunctionType = FunctionType<{
    editType: EditType;
    criticismSuggestionId: Guid;
    criticismSuggestion: Omit<CriticismSuggestion, 'id'> | null;
}, void, {
    editType: EditType;
    criticismSuggestionId: string;
    criticismSuggestion: Omit<CriticismSuggestion.Flatten, 'id'> | null;
}>;
