import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterContainer, ParameterParser, type FunctionType } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { getPrivateKeys } from '../privateKeys';
import { Occupancy } from '../types/Occupancy';
import { checkUserRoles } from '../checkUserRoles';
import { DatabaseScheme } from '../DatabaseScheme';

export class OccupancyGetAllFunction implements FirebaseFunction<OccupancyGetAllFunctionType> {
    public readonly parameters: FunctionType.Parameters<OccupancyGetAllFunctionType> & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, private readonly auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('OccupancyGetAllFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getPrivateKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<FunctionType.Parameters<OccupancyGetAllFunctionType>>({}, this.logger.nextIndent);
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<OccupancyGetAllFunctionType>> {
        this.logger.log('OccupancyGetAllFunction.executeFunction', {}, 'info');
        await checkUserRoles(this.auth, 'occupancyManager', this.parameters.databaseType, this.logger.nextIndent);
        const reference = DatabaseScheme.reference(this.parameters.databaseType).child('occupancies');
        const snapshot = await reference.snapshot();
        if (!snapshot.exists || !snapshot.hasChildren)
            return [];
        return snapshot.compactMap(snapshot => {
            if (snapshot.key === null)
                return null;
            return {
                ...snapshot.value('decrypt'),
                id: snapshot.key
            };
        });
    }
}

export type OccupancyGetAllFunctionType = FunctionType<Record<string, never>, Array<Occupancy.Flatten>>;
