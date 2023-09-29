import { type DatabaseType, type IFirebaseFunction, type ILogger, Guid, ParameterBuilder, ParameterParser, type IFunctionType, HttpsError, CryptedScheme, IParameterContainer, IDatabaseReference, GuardParameterBuilder, NullableParameterBuilder } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { EditType } from '../types/EditType';
import { Occupancy } from '../types/Occupancy';
import { checkUserRoles } from '../checkUserRoles';
import { DatabaseScheme } from '../DatabaseScheme';
import { Discord } from '../Discord';

export class OccupancyEditFunction implements IFirebaseFunction<OccupancyEditFunctionType> {
    public readonly parameters: IFunctionType.Parameters<OccupancyEditFunctionType> & { databaseType: DatabaseType };

    public constructor(
        parameterContainer: IParameterContainer, 
        private readonly auth: AuthData | null, 
        private readonly databaseReference: IDatabaseReference<DatabaseScheme>, 
        private readonly logger: ILogger
    ) {
        this.logger.log('OccupancyEditFunction.constructor', { auth: auth }, 'notice');
        const parameterParser = new ParameterParser<IFunctionType.Parameters<OccupancyEditFunctionType>>(
            {
                editType: new GuardParameterBuilder('string', EditType.typeGuard),
                occupancyId: new ParameterBuilder('string', Guid.fromString),
                occupancy: new NullableParameterBuilder(new ParameterBuilder('object', Occupancy.fromObject))
            },
            this.logger.nextIndent
        );
        parameterParser.parse(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async execute(): Promise<IFunctionType.ReturnType<OccupancyEditFunctionType>> {
        this.logger.log('OccupancyEditFunction.executeFunction', {}, 'info');
        await checkUserRoles(this.auth, 'occupancyManager', this.databaseReference, this.logger.nextIndent);
        switch (this.parameters.editType) {
            case 'add':
                return await this.addOccupancy();
            case 'change':
                return await this.changeOccupancy();
            case 'remove':
                return await this.removeOccupancy();
        }
    }

    private get reference(): IDatabaseReference<CryptedScheme<Omit<Occupancy.Flatten, 'id'>>> {
        return this.databaseReference.child('occupancies').child(this.parameters.occupancyId.guidString);
    }

    private async getDatabaseOccupancy(): Promise<Omit<Occupancy, 'id'> | null> {
        const snapshot = await this.reference.snapshot();
        if (!snapshot.exists)
            return null;
        return Occupancy.concrete(snapshot.value('decrypt'));
    }

    private async addOccupancy() {
        if (!this.parameters.occupancy)
            throw HttpsError('invalid-argument', 'No occupancy in parameters to add.', this.logger);
        const databaseOccupancy = await this.getDatabaseOccupancy();
        if (databaseOccupancy)
            throw HttpsError('invalid-argument', 'Couldn\'t add existing occupancy.', this.logger);
        const occupancy = this.parameters.occupancy;
        const discordMessageId = await Discord.execute(this.parameters.databaseType, async discord => {
            return await discord.add('occupancies', Occupancy.discordEmbed(occupancy));
        }, null);
        await this.reference.set(Occupancy.flatten(Occupancy.addDiscordMessageId(occupancy, discordMessageId)), 'encrypt');
    }

    private async changeOccupancy() {
        if (!this.parameters.occupancy)
            throw HttpsError('invalid-argument', 'No occupancy in parameters to change.', this.logger);
        const databaseOccupancy = await this.getDatabaseOccupancy();
        if (!databaseOccupancy)
            throw HttpsError('invalid-argument', 'Couldn\'t change not existing occupancy.', this.logger);
        const occupancy = Occupancy.addDiscordMessageId(this.parameters.occupancy, databaseOccupancy.discordMessageId);
        void Discord.execute(this.parameters.databaseType, async discord => {
            await discord.change('occupancies', occupancy.discordMessageId, Occupancy.discordEmbed(occupancy));
        });
        await this.reference.set(Occupancy.flatten(occupancy), 'encrypt');
    }
    
    private async removeOccupancy() {
        const databaseOccupancy = await this.getDatabaseOccupancy();
        if (!databaseOccupancy)
            return;
        void Discord.execute(this.parameters.databaseType, async discord => {
            await discord.remove('occupancies', databaseOccupancy.discordMessageId);
        });
        await this.reference.remove();
    }
}

export type OccupancyEditFunctionType = IFunctionType<{
    editType: EditType;
    occupancyId: Guid;
    occupancy: Omit<Occupancy, 'id' | 'discordMessageId'> | null;
}, void, {
    editType: EditType;
    occupancyId: string;
    occupancy: Omit<Occupancy.Flatten, 'id' | 'discordMessageId'> | null;
}>;
