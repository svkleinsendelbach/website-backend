import { type DatabaseType, type IFirebaseFunction, type ILogger, ParameterParser, UtcDate, type IFunctionType, IDatabaseReference, IParameterContainer, GuardParameterBuilder, ArrayParameterBuilder } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { DatabaseScheme } from '../DatabaseScheme';
import { ReportGroupId, type Report, ReportGroup } from '../types/Report';

export class ReportGetFunction implements IFirebaseFunction<ReportGetFunctionType> {
    public readonly parameters: IFunctionType.Parameters<ReportGetFunctionType> & { databaseType: DatabaseType };

    public constructor(
        parameterContainer: IParameterContainer, 
        auth: AuthData | null, 
        private readonly databaseReference: IDatabaseReference<DatabaseScheme>, 
        private readonly logger: ILogger
    ) {
        this.logger.log('ReportGetFunction.constructor', { auth: auth }, 'notice');
        const parameterParser = new ParameterParser<IFunctionType.Parameters<ReportGetFunctionType>>(
            {
                groupIds: new ArrayParameterBuilder(new GuardParameterBuilder('string', ReportGroupId.typeGuard))
            },
            this.logger.nextIndent
        );
        parameterParser.parse(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async execute(): Promise<IFunctionType.ReturnType<ReportGetFunctionType>> {
        this.logger.log('ReportGetFunction.executeFunction', {}, 'info');
        return (await Promise.all(this.parameters.groupIds.map(async id => await this.getReportGroup(id)))).flatMap(reportGroup => reportGroup ?? []);
    }

    public async getReportGroup(groupId: ReportGroupId): Promise<ReportGroup.Flatten | null> {
        const reference = this.databaseReference.child('reports').child(groupId);
        const snapshot = await reference.snapshot();
        if (!snapshot.exists || !snapshot.hasChildren)
            return null;
        const reports = snapshot.compactMap<Omit<Report.Flatten, 'discordMessageId'>>(snapshot => {
            if (snapshot.key === null)
                return null;
            const report = snapshot.value('decrypt') as Omit<Report.Flatten, 'id' | 'discordMessageId'>;
            if ('discordMessageId' in report)
                delete report.discordMessageId;
            return {
                ...report,
                id: snapshot.key
            };
        });
        reports.sort((a, b) => UtcDate.decode(a.createDate).compare(UtcDate.decode(b.createDate)) === 'greater' ? -1 : 1);
        return {
            groupId: groupId,
            reports: reports
        };
    }
}

export type ReportGetFunctionType = IFunctionType<{
    groupIds: ReportGroupId[];
}, ReportGroup.Flatten[]>;
