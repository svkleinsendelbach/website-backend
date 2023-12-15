import { type DatabaseType, type IFirebaseFunction, type ILogger, ParameterParser, type IFunctionType, IDatabaseReference, IParameterContainer } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { Occupancy } from '../types/Occupancy';
import { checkUserRoles } from '../checkUserRoles';
import { DatabaseScheme } from '../DatabaseScheme';

export class OccupancyGetFunction implements IFirebaseFunction<OccupancyGetFunctionType> {
    public readonly parameters: IFunctionType.Parameters<OccupancyGetFunctionType> & { databaseType: DatabaseType };

    public constructor(
        parameterContainer: IParameterContainer, 
        private readonly auth: AuthData | null, 
        private readonly databaseReference: IDatabaseReference<DatabaseScheme>, 
        private readonly logger: ILogger
    ) {
        this.logger.log('OccupancyGetFunction.constructor', { auth: auth }, 'notice');
        const parameterParser = new ParameterParser<IFunctionType.Parameters<OccupancyGetFunctionType>>({}, this.logger.nextIndent);
        parameterParser.parse(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async execute(): Promise<IFunctionType.ReturnType<OccupancyGetFunctionType>> {
        this.logger.log('OccupancyGetFunction.executeFunction', {}, 'info');
        await checkUserRoles(this.auth, 'occupancyManager', this.databaseReference, this.logger.nextIndent);
        const reference = this.databaseReference.child('occupancies');
        const snapshot = await reference.snapshot();
        if (!snapshot.exists || !snapshot.hasChildren)
            return [];
        return snapshot.compactMap(snapshot => {
            if (snapshot.key === null)
                return null;
            const occupancy = snapshot.value('decrypt') as Omit<Occupancy.Flatten, 'id' | 'discordMessageId'>;
            if ('discordMessageId' in occupancy)
                delete occupancy.discordMessageId;
            return {
                ...occupancy,
                id: snapshot.key
            };
        });
    }
}

export type OccupancyGetFunctionType = IFunctionType<Record<string, never>, Array<Omit<Occupancy.Flatten, 'discordMessageId'>>>;
