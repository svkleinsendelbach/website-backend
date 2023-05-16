import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, type FunctionType, DatabaseReference, HttpsError } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { getPrivateKeys } from '../privateKeys';
import { EditType } from '../types/EditType';
import { Guid } from '../types/Guid';
import { OccupancyLocation } from '../types/OccupancyLocation';
import { checkUserAuthentication } from '../checkUserAuthentication';
import { type DatabaseScheme } from '../DatabaseScheme';

export class OccupancyLocationEditFunction implements FirebaseFunction<OccupancyLocationEditFunctionType> {
    public readonly parameters: FunctionType.Parameters<OccupancyLocationEditFunctionType> & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, private readonly auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('OccupancyLocationEditFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getPrivateKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<FunctionType.Parameters<OccupancyLocationEditFunctionType>>(
            {
                editType: ParameterBuilder.guard('string', EditType.typeGuard),
                locationId: ParameterBuilder.build('string', Guid.fromString),
                location: ParameterBuilder.optional(ParameterBuilder.build('object', OccupancyLocation.fromObject))
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<OccupancyLocationEditFunctionType>> {
        this.logger.log('OccupancyLocationEditFunction.executeFunction', {}, 'info');
        await checkUserAuthentication(this.auth, 'editOccupancy', this.parameters.databaseType, this.logger);
        const reference = DatabaseReference.base<DatabaseScheme>(getPrivateKeys(this.parameters.databaseType)).child('occupancy').child('locations').child(this.parameters.locationId.guidString);
        const snapshot = await reference.snapshot();
        if (this.parameters.editType === 'remove') {
            if (snapshot.exists)
                await reference.remove();
        } else {
            if (this.parameters.location === undefined)
                throw HttpsError('invalid-argument', 'No location in parameters to add / change.', this.logger);
            if (this.parameters.editType === 'add' && snapshot.exists)
                throw HttpsError('invalid-argument', 'Couldn\'t add existing location.', this.logger);
            if (this.parameters.editType === 'change' && !snapshot.exists)
                throw HttpsError('invalid-argument', 'Couldn\'t change not existing location.', this.logger);
            await reference.set(OccupancyLocation.flatten(this.parameters.location), 'encrypt');
        }
    }
}

export type OccupancyLocationEditFunctionType = FunctionType<{
    editType: EditType;
    locationId: Guid;
    location: Omit<OccupancyLocation, 'id'> | undefined;
}, void, {
    editType: EditType;
    locationId: string;
    location: Omit<OccupancyLocation.Flatten, 'id'> | undefined;
}>;
