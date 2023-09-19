import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, type FunctionType, HttpsError, CryptedScheme, DatabaseReference } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { getPrivateKeys } from '../privateKeys';
import { EditType } from '../types/EditType';
import { Guid } from '../types/Guid';
import { Occupancy } from '../types/Occupancy';
import { checkUserRoles } from '../checkUserRoles';
import { DatabaseScheme } from '../DatabaseScheme';
import { Discord } from '../discord';

export class OccupancyEditFunction implements FirebaseFunction<OccupancyEditFunctionType> {
    public readonly parameters: FunctionType.Parameters<OccupancyEditFunctionType> & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, private readonly auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('OccupancyEditFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getPrivateKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<FunctionType.Parameters<OccupancyEditFunctionType>>(
            {
                editType: ParameterBuilder.guard('string', EditType.typeGuard),
                occupancyId: ParameterBuilder.build('string', Guid.fromString),
                occupancy: ParameterBuilder.nullable(ParameterBuilder.build('object', Occupancy.fromObject))
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<OccupancyEditFunctionType>> {
        this.logger.log('OccupancyEditFunction.executeFunction', {}, 'info');
        await checkUserRoles(this.auth, 'occupancyManager', this.parameters.databaseType, this.logger.nextIndent);
        switch (this.parameters.editType) {
            case 'add':
                return await this.addOccupancy();
            case 'change':
                return await this.changeOccupancy();
            case 'remove':
                return await this.removeOccupancy();
        }
    }

    private get reference(): DatabaseReference<CryptedScheme<Omit<Occupancy.Flatten, 'id'>>> {
        return DatabaseScheme.reference(this.parameters.databaseType).child('occupancies').child(this.parameters.occupancyId.guidString);
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
        let occupancy = Occupancy.addDiscordMessageId(this.parameters.occupancy, null);
        occupancy = await Discord.execute(this.parameters.databaseType, async discord => {
            return await discord.addOccupancy(occupancy);
        }, occupancy);
        await this.reference.set(Occupancy.flatten(occupancy), 'encrypt');
    }

    private async changeOccupancy() {
        if (!this.parameters.occupancy)
            throw HttpsError('invalid-argument', 'No occupancy in parameters to change.', this.logger);
        const databaseOccupancy = await this.getDatabaseOccupancy();
        if (!databaseOccupancy)
            throw HttpsError('invalid-argument', 'Couldn\'t change not existing occupancy.', this.logger);
        const occupancy = Occupancy.addDiscordMessageId(this.parameters.occupancy, databaseOccupancy.discordMessageId);
        void Discord.execute(this.parameters.databaseType, async discord => {
            await discord.changeOccupancy(occupancy);
        });
        await this.reference.set(Occupancy.flatten(occupancy), 'encrypt');
    }
    
    private async removeOccupancy() {
        const databaseOccupancy = await this.getDatabaseOccupancy();
        if (!databaseOccupancy)
            return;
        void Discord.execute(this.parameters.databaseType, async discord => {
            await discord.removeOccupancy(databaseOccupancy);
        });
        await this.reference.remove();
    }
}

export type OccupancyEditFunctionType = FunctionType<{
    editType: EditType;
    occupancyId: Guid;
    occupancy: Omit<Occupancy, 'id' | 'discordMessageId'> | null;
}, void, {
    editType: EditType;
    occupancyId: string;
    occupancy: Omit<Occupancy.Flatten, 'id' | 'discordMessageId'> | null;
}>;
