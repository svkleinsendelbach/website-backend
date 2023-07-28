import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, type FunctionType, DatabaseReference, HttpsError } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkUserAuthentication } from '../checkUserAuthentication';
import { type DatabaseScheme } from '../DatabaseScheme';
import { getPrivateKeys } from '../privateKeys';
import { EditType } from '../types/EditType';
import { Guid } from '../types/Guid';
import { Report, ReportGroupId } from '../types/Report';
import { UtcDate } from '../types/UtcDate';
import { baseDatabaseReference } from '../utils';

export class ReportEditFunction implements FirebaseFunction<ReportEditFunctionType> {
    public readonly parameters: FunctionType.Parameters<ReportEditFunctionType> & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, private readonly auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('ReportEditFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getPrivateKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<FunctionType.Parameters<ReportEditFunctionType>>(
            {
                editType: ParameterBuilder.guard('string', EditType.typeGuard),
                groupId: ParameterBuilder.guard('string', ReportGroupId.typeGuard),
                previousGroupId: ParameterBuilder.optional(ParameterBuilder.guard('string', ReportGroupId.typeGuard)),
                reportId: ParameterBuilder.build('string', Guid.fromString),
                report: ParameterBuilder.optional(ParameterBuilder.build('object', Report.fromObject))
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<ReportEditFunctionType>> {
        this.logger.log('ReportEditFunction.executeFunction', {}, 'info');
        await checkUserAuthentication(this.auth, 'editReports', this.parameters.databaseType, this.logger);
        const reference = DatabaseReference.base<DatabaseScheme>(getPrivateKeys(this.parameters.databaseType)).child('reports').child(this.parameters.groupId).child(this.parameters.reportId.guidString);
        const snapshot = await reference.snapshot();
        if (this.parameters.editType === 'remove') {
            if (snapshot.exists)
                await reference.remove();
        } else {
            if (this.parameters.report === undefined)
                throw HttpsError('invalid-argument', 'No report in parameters to add / change.', this.logger);
            if (this.parameters.editType === 'add' && snapshot.exists)
                throw HttpsError('invalid-argument', 'Couldn\'t add existing report.', this.logger);
            if (this.parameters.editType === 'change') {
                if (this.parameters.previousGroupId === undefined)
                    throw HttpsError('invalid-argument', 'No previous group id in parameters to change.', this.logger);
                const previousReference = DatabaseReference.base<DatabaseScheme>(getPrivateKeys(this.parameters.databaseType)).child('reports').child(this.parameters.previousGroupId).child(this.parameters.reportId.guidString);
                const previousSnapshot = await previousReference.snapshot();
                if (!previousSnapshot.exists)
                    throw HttpsError('invalid-argument', 'Couldn\'t change not existing report.', this.logger);
                await previousReference.remove();
            }
            await reference.set(Report.flatten(this.parameters.report), 'encrypt');
        }

        const currentDate = UtcDate.now.setted({ hour: 0, minute: 0 });
        if (this.parameters.previousGroupId !== undefined) {
            const changesReference = baseDatabaseReference(this.parameters.databaseType).child('reports').child(this.parameters.previousGroupId).child('changes').child(currentDate.encoded).child(this.parameters.reportId.guidString);
            await changesReference.set(this.parameters.reportId.guidString);
        }
        const changesReference = baseDatabaseReference(this.parameters.databaseType).child('reports').child(this.parameters.groupId).child('changes').child(currentDate.encoded).child(this.parameters.reportId.guidString);
        await changesReference.set(this.parameters.reportId.guidString);
    }
}

export type ReportEditFunctionType = FunctionType<{
    editType: EditType;
    groupId: ReportGroupId;
    previousGroupId: ReportGroupId | undefined;
    reportId: Guid;
    report: Omit<Report, 'id'> | undefined;
}, void, {
    editType: EditType;
    groupId: ReportGroupId;
    previousGroupId: ReportGroupId | undefined;
    reportId: string;
    report: Omit<Report.Flatten, 'id'> | undefined;
}>;
