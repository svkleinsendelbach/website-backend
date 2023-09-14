import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, type FunctionType, DatabaseReference, HttpsError } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { getPrivateKeys } from '../privateKeys';
import { EditType } from '../types/EditType';
import { Guid } from '../types/Guid';
import { Occupancy } from '../types/Occupancy';
import { checkUserRoles } from '../checkUserRoles';
import { DatabaseScheme } from '../DatabaseScheme';

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
        await checkUserRoles(this.auth, 'occupancyManager', this.parameters.databaseType, this.logger);
        const reference = DatabaseReference.base<DatabaseScheme>(getPrivateKeys(this.parameters.databaseType)).child('occupancies').child(this.parameters.occupancyId.guidString);
        const snapshot = await reference.snapshot();
        if (this.parameters.editType === 'remove') {
            if (snapshot.exists)
                await reference.remove();
        } else {
            if (!this.parameters.occupancy)
                throw HttpsError('invalid-argument', 'No occupancy in parameters to add / change.', this.logger);
            if (this.parameters.editType === 'add' && snapshot.exists)
                throw HttpsError('invalid-argument', 'Couldn\'t add existing occupancy.', this.logger);
            if (this.parameters.editType === 'change' && !snapshot.exists) {
                throw HttpsError('invalid-argument', 'Couldn\'t change not existing occupancy.', this.logger);
            }
            await reference.set(Occupancy.flatten(this.parameters.occupancy), 'encrypt');
        }
    }
}

export type OccupancyEditFunctionType = FunctionType<{
    editType: EditType;
    occupancyId: Guid;
    occupancy: Omit<Occupancy, 'id'> | null;
}, void, {
    editType: EditType;
    occupancyId: string;
    occupancy: Omit<Occupancy.Flatten, 'id'> | null;
}>;
