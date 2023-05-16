import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, type FunctionType, DatabaseReference, HttpsError } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { getPrivateKeys } from '../privateKeys';
import { OccupancyAssignment } from '../types/OccupancyAssignment';
import { EditType } from '../types/EditType';
import { Guid } from '../types/Guid';
import { checkUserAuthentication } from '../checkUserAuthentication';
import { type DatabaseScheme } from '../DatabaseScheme';

export class OccupancyAssignmentEditFunction implements FirebaseFunction<OccupancyAssignmentEditFunctionType> {
    public readonly parameters: FunctionType.Parameters<OccupancyAssignmentEditFunctionType> & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, private readonly auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('OccupancyAssignmentEditFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getPrivateKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<FunctionType.Parameters<OccupancyAssignmentEditFunctionType>>(
            {
                editType: ParameterBuilder.guard('string', EditType.typeGuard),
                assignmentId: ParameterBuilder.build('string', Guid.fromString),
                assignment: ParameterBuilder.optional(ParameterBuilder.build('object', OccupancyAssignment.fromObject))
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<OccupancyAssignmentEditFunctionType>> {
        this.logger.log('OccupancyAssignmentEditFunction.executeFunction', {}, 'info');
        await checkUserAuthentication(this.auth, 'editOccupancy', this.parameters.databaseType, this.logger);
        const reference = DatabaseReference.base<DatabaseScheme>(getPrivateKeys(this.parameters.databaseType)).child('occupancy').child('assignments').child(this.parameters.assignmentId.guidString);
        const snapshot = await reference.snapshot();
        if (this.parameters.editType === 'remove') {
            if (snapshot.exists)
                await reference.remove();
        } else {
            if (this.parameters.assignment === undefined)
                throw HttpsError('invalid-argument', 'No assignment in parameters to add / change.', this.logger);
            if (this.parameters.editType === 'add' && snapshot.exists)
                throw HttpsError('invalid-argument', 'Couldn\'t add existing assignment.', this.logger);
            if (this.parameters.editType === 'change' && !snapshot.exists)
                throw HttpsError('invalid-argument', 'Couldn\'t change not existing assignment.', this.logger);
            await reference.set(OccupancyAssignment.flatten(this.parameters.assignment), 'encrypt');
        }
    }
}

export type OccupancyAssignmentEditFunctionType = FunctionType<{
    editType: EditType;
    assignmentId: Guid;
    assignment: Omit<OccupancyAssignment, 'id'> | undefined;
}, void, {
    editType: EditType;
    assignmentId: string;
    assignment: Omit<OccupancyAssignment.Flatten, 'id'> | undefined;
}>;
