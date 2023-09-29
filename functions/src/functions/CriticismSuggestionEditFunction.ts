import { type DatabaseType, type IFirebaseFunction, type ILogger, ParameterBuilder, ParameterParser, type IFunctionType, HttpsError, IParameterContainer, IDatabaseReference, GuardParameterBuilder, NullableParameterBuilder, Guid } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { EditType } from '../types/EditType';
import { CriticismSuggestion } from '../types/CriticismSuggestion';
import { checkUserRoles } from '../checkUserRoles';
import { DatabaseScheme } from '../DatabaseScheme';
import { Discord } from '../Discord';

export class CriticismSuggestionEditFunction implements IFirebaseFunction<CriticismSuggestionEditFunctionType> {
    public readonly parameters: IFunctionType.Parameters<CriticismSuggestionEditFunctionType> & { databaseType: DatabaseType };

    public constructor(
        parameterContainer: IParameterContainer, 
        private readonly auth: AuthData | null, 
        private readonly databaseReference: IDatabaseReference<DatabaseScheme>, 
        private readonly logger: ILogger
    ) {
        this.logger.log('CriticismSuggestionEditFunction.constructor', { auth: auth }, 'notice');
        const parameterParser = new ParameterParser<IFunctionType.Parameters<CriticismSuggestionEditFunctionType>>(
            {
                editType: new GuardParameterBuilder('string', EditType.typeGuard),
                criticismSuggestionId: new ParameterBuilder('string', Guid.fromString),
                criticismSuggestion: new NullableParameterBuilder(new ParameterBuilder('object', CriticismSuggestion.fromObject))
            },
            this.logger.nextIndent
        );
        parameterParser.parse(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async execute(): Promise<IFunctionType.ReturnType<CriticismSuggestionEditFunctionType>> {
        this.logger.log('CriticismSuggestionEditFunction.executeFunction', {}, 'info');
        if (this.parameters.editType !== 'add')
            await checkUserRoles(this.auth, 'admin', this.databaseReference, this.logger.nextIndent);
        const reference = this.databaseReference.child('criticismSuggestions').child(this.parameters.criticismSuggestionId.guidString);
        const snapshot = await reference.snapshot();
        if (this.parameters.editType === 'remove') {
            if (snapshot.exists)
                await reference.remove();
        } else {
            if (!this.parameters.criticismSuggestion)
                throw HttpsError('invalid-argument', 'No criticism suggestion in parameters to add / change.', this.logger);
            if (this.parameters.editType === 'add') {
                if (snapshot.exists)
                    throw HttpsError('invalid-argument', 'Couldn\'t add existing criticism suggestion.', this.logger);
                const criticismSuggestion = this.parameters.criticismSuggestion;
                void Discord.execute(this.parameters.databaseType, async discord => {                    
                    await discord.add('criticismSuggestions', CriticismSuggestion.discordEmbed(criticismSuggestion));
                });
            }
            if (this.parameters.editType === 'change' && !snapshot.exists)
                throw HttpsError('invalid-argument', 'Couldn\'t change not existing criticism suggestion.', this.logger);
            await reference.set(CriticismSuggestion.flatten(this.parameters.criticismSuggestion), 'encrypt');
        }
    }
}

export type CriticismSuggestionEditFunctionType = IFunctionType<{
    editType: EditType;
    criticismSuggestionId: Guid;
    criticismSuggestion: Omit<CriticismSuggestion, 'id'> | null;
}, void, {
    editType: EditType;
    criticismSuggestionId: string;
    criticismSuggestion: Omit<CriticismSuggestion.Flatten, 'id'> | null;
}>;
