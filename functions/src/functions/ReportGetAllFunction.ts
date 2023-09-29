import { type DatabaseType, type IFirebaseFunction, type ILogger, ParameterParser, type IFunctionType, UtcDate, IDatabaseReference, IParameterContainer } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { DatabaseScheme } from '../DatabaseScheme';
import { ReportGroupId, type Report } from '../types/Report';

export class ReportGetAllFunction implements IFirebaseFunction<ReportGetAllFunctionType> {
    public readonly parameters: IFunctionType.Parameters<ReportGetAllFunctionType> & { databaseType: DatabaseType };

    public constructor(
        parameterContainer: IParameterContainer, 
        auth: AuthData | null, 
        private readonly databaseReference: IDatabaseReference<DatabaseScheme>, 
        private readonly logger: ILogger
    ) {
        this.logger.log('ReportGetAllFunction.constructor', { auth: auth }, 'notice');
        const parameterParser = new ParameterParser<IFunctionType.Parameters<ReportGetAllFunctionType>>({}, this.logger.nextIndent);
        parameterParser.parse(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async execute(): Promise<IFunctionType.ReturnType<ReportGetAllFunctionType>> {
        this.logger.log('ReportGetAllFunction.executeFunction', {}, 'info');
        const reports = (await Promise.all(ReportGroupId.all.map(async groupId => await this.getReports(groupId)))).flatMap(reports => reports);
        reports.sort((a, b) => UtcDate.decode(a.createDate).compare(UtcDate.decode(b.createDate)) === 'greater' ? -1 : 1);
        return reports;
    }

    private async getReports(groupId: ReportGroupId): Promise<Array<Omit<Report.Flatten, 'discordMessageId'> & { groupId: ReportGroupId }>> {
        this.logger.log('ReportGetAllFunction.getReports', { groupId: groupId }, 'info');
        const reference = this.databaseReference.child('reports').child(groupId);
        const snapshot = await reference.snapshot();
        if (!snapshot.exists || !snapshot.hasChildren)
            return [];
        return snapshot.compactMap(snapshot => {
            if (snapshot.key === null)
                return null;
            const report = snapshot.value('decrypt') as Omit<Report.Flatten, 'id' | 'discordMessageId'>;
            if ('discordMessageId' in report)
                delete report.discordMessageId;
            return {
                ...report,
                id: snapshot.key,
                groupId: groupId
            };
        });
    }
}

export type ReportGetAllFunctionType = IFunctionType<Record<string, never>, Array<Omit<Report.Flatten, 'discordMessageId'> & { groupId: ReportGroupId }>>;
