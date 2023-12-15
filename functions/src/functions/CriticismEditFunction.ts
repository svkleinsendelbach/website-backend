import { type DatabaseType, type IFirebaseFunction, type ILogger, ParameterBuilder, ParameterParser, type IFunctionType, HttpsError, IParameterContainer, IDatabaseReference, GuardParameterBuilder, NullableParameterBuilder, Guid } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { EditType } from '../types/EditType';
import { Criticism } from '../types/Criticism';
import { checkUserRoles } from '../checkUserRoles';
import { DatabaseScheme } from '../DatabaseScheme';
import { Discord } from '../Discord';
import { discordKeys } from '../privateKeys';

export class CriticismEditFunction implements IFirebaseFunction<CriticismEditFunctionType> {
    public readonly parameters: IFunctionType.Parameters<CriticismEditFunctionType> & { databaseType: DatabaseType };

    public constructor(
        parameterContainer: IParameterContainer, 
        private readonly auth: AuthData | null, 
        private readonly databaseReference: IDatabaseReference<DatabaseScheme>, 
        private readonly logger: ILogger
    ) {
        this.logger.log('CriticismEditFunction.constructor', { auth: auth }, 'notice');
        const parameterParser = new ParameterParser<IFunctionType.Parameters<CriticismEditFunctionType>>(
            {
                editType: new GuardParameterBuilder('string', EditType.typeGuard),
                criticismId: new ParameterBuilder('string', Guid.fromString),
                criticism: new NullableParameterBuilder(new ParameterBuilder('object', Criticism.fromObject))
            },
            this.logger.nextIndent
        );
        parameterParser.parse(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async execute(): Promise<IFunctionType.ReturnType<CriticismEditFunctionType>> {
        this.logger.log('CriticismEditFunction.executeFunction', {}, 'info');
        if (this.parameters.editType !== 'add')
            await checkUserRoles(this.auth, 'admin', this.databaseReference, this.logger.nextIndent);
        const reference = this.databaseReference.child('criticisms').child(this.parameters.criticismId.guidString);
        const snapshot = await reference.snapshot();
        if (this.parameters.editType === 'remove') {
            if (snapshot.exists)
                await reference.remove();
        } else {
            if (!this.parameters.criticism)
                throw HttpsError('invalid-argument', 'No criticism suggestion in parameters to add / change.', this.logger);
            if (this.parameters.editType === 'add') {
                if (snapshot.exists)
                    throw HttpsError('invalid-argument', 'Couldn\'t add existing criticism suggestion.', this.logger);
                const criticism = this.parameters.criticism;
                void Discord.execute(this.parameters.databaseType, async discord => {                    
                    await discord.add(discordKeys.channelIds.criticisms, { embeds: [Criticism.discordEmbed(criticism)] });
                });
            }
            if (this.parameters.editType === 'change' && !snapshot.exists)
                throw HttpsError('invalid-argument', 'Couldn\'t change not existing criticism suggestion.', this.logger);
            await reference.set(Criticism.flatten(this.parameters.criticism), 'encrypt');
        }
    }
}

export type CriticismEditFunctionType = IFunctionType<{
    editType: EditType;
    criticismId: Guid;
    criticism: Omit<Criticism, 'id'> | null;
}, void, {
    editType: EditType;
    criticismId: string;
    criticism: Omit<Criticism.Flatten, 'id'> | null;
}>;
