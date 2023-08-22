import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterContainer, ParameterParser, type FunctionType, DatabaseReference, UtcDate } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { type DatabaseScheme } from '../DatabaseScheme';
import { getPrivateKeys } from '../privateKeys';
import { ReportGroupId, type Report } from '../types/Report';

export class ReportGetAllFunction implements FirebaseFunction<ReportGetAllFunctionType> {
    public readonly parameters: FunctionType.Parameters<ReportGetAllFunctionType> & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('ReportGetAllFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getPrivateKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<FunctionType.Parameters<ReportGetAllFunctionType>>({}, this.logger.nextIndent);
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<ReportGetAllFunctionType>> {
        this.logger.log('ReportGetAllFunction.executeFunction', {}, 'info');
        const reports = (await Promise.all(ReportGroupId.all.map(async groupId => await this.getReports(groupId)))).flatMap(reports => reports);
        reports.sort((a, b) => UtcDate.decode(a.createDate).compare(UtcDate.decode(b.createDate)) === 'greater' ? -1 : 1);
        return reports;
    }

    private async getReports(groupId: ReportGroupId): Promise<Array<Report.Flatten & { groupId: ReportGroupId }>> {
        this.logger.log('ReportGetAllFunction.getReports', { groupId: groupId }, 'info');
        const reference = DatabaseReference.base<DatabaseScheme>(getPrivateKeys(this.parameters.databaseType)).child('reports').child(groupId);
        const snapshot = await reference.snapshot();
        if (!snapshot.exists || !snapshot.hasChildren)
            return [];
        return snapshot.compactMap(snapshot => {
            if (snapshot.key === null)
                return undefined;
            return {
                ...snapshot.value('decrypt'),
                id: snapshot.key,
                groupId: groupId
            };
        });
    }
}

export type ReportGetAllFunctionType = FunctionType<Record<string, never>, Array<Report.Flatten & { groupId: ReportGroupId }>>;
