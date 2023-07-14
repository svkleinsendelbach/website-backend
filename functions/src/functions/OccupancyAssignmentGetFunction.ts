import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterContainer, ParameterParser, type FunctionType, DatabaseReference } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { getPrivateKeys } from '../privateKeys';
import { type OccupancyLocation } from '../types/OccupancyLocation';
import { type OccupancyAssignment } from '../types/OccupancyAssignment';
import { type DatabaseScheme } from '../DatabaseScheme';
import { UtcDate } from '../types/UtcDate';

export class OccupancyAssignmentGetFunction implements FirebaseFunction<OccupancyAssignmentGetFunctionType> {
    public readonly parameters: FunctionType.Parameters<OccupancyAssignmentGetFunctionType> & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('OccupancyAssignmentGetFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getPrivateKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<FunctionType.Parameters<OccupancyAssignmentGetFunctionType>>({}, this.logger.nextIndent);
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<OccupancyAssignmentGetFunctionType>> {
        this.logger.log('OccupancyAssignmentGetFunction.executeFunction', {}, 'info');
        const [locations, assignments] = await Promise.all([this.getLocations(), this.getAssignments()]);
        assignments.sort((a, b) => UtcDate.decode(a.startDate).compare(UtcDate.decode(b.startDate)) === 'less' ? -1 : 1);
        return {
            locations: locations,
            assignments: assignments
        };
    }

    private async getLocations(): Promise<Record<string, Omit<OccupancyLocation.Flatten, 'id'>>> {
        const reference = DatabaseReference.base<DatabaseScheme>(getPrivateKeys(this.parameters.databaseType)).child('occupancy').child('locations');
        const snapshot = await reference.snapshot();
        if (!snapshot.exists)
            return {};
        return snapshot.reduce({} as Record<string, Omit<OccupancyLocation.Flatten, 'id'>>, (locations, snapshot) => {
            if (snapshot.key === null)
                return locations;
            return {
                ...locations,
                [snapshot.key]: snapshot.value('decrypt')
            };
        });
    }

    private async getAssignments(): Promise<OccupancyAssignment.Flatten[]> {
        const reference = DatabaseReference.base<DatabaseScheme>(getPrivateKeys(this.parameters.databaseType)).child('occupancy').child('assignments');
        const snapshot = await reference.snapshot();
        if (!snapshot.exists)
            return [];
        return snapshot.reduce([] as OccupancyAssignment.Flatten[], (assignments, snapshot) => {
            if (snapshot.key === null)
                return assignments;
            return [
                ...assignments,
                {
                    ...snapshot.value('decrypt'),
                    id: snapshot.key
                }
            ];
        });
    }
}

export type OccupancyAssignmentGetFunctionType = FunctionType<Record<string, never>, {
    locations: Record<string, Omit<OccupancyLocation.Flatten, 'id'>>;
    assignments: OccupancyAssignment.Flatten[];
}>;
