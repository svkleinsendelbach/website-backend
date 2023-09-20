import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, UtcDate, type FunctionType } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { DatabaseScheme } from '../DatabaseScheme';
import { getPrivateKeys } from '../privateKeys';
import { ReportGroupId, type Report } from '../types/Report';

export class ReportGetFunction implements FirebaseFunction<ReportGetFunctionType> {
    public readonly parameters: FunctionType.Parameters<ReportGetFunctionType> & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('ReportGetFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getPrivateKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<FunctionType.Parameters<ReportGetFunctionType>>(
            {
                groupId: ParameterBuilder.guard('string', ReportGroupId.typeGuard),
                numberReports: ParameterBuilder.nullable(ParameterBuilder.value('number'))
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<ReportGetFunctionType>> {
        this.logger.log('ReportGetFunction.executeFunction', {}, 'info');
        const reference = DatabaseScheme.reference(this.parameters.databaseType).child('reports').child(this.parameters.groupId);
        const snapshot = await reference.snapshot();
        if (!snapshot.exists || !snapshot.hasChildren)
            return { reports: [], hasMore: false };
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
        if (this.parameters.numberReports === null)
            return { reports: reports, hasMore: false };
        const reportsToReturn: Omit<Report.Flatten, 'discordMessageId'>[] = [];
        let hasMore = false;
        for (const report of reports) {
            if (reportsToReturn.length === this.parameters.numberReports) {
                hasMore = true;
                break;
            }
            reportsToReturn.push(report);
        }
        return { reports: reportsToReturn, hasMore: hasMore };
    }
}

export type ReportGetFunctionType = FunctionType<{
    groupId: ReportGroupId;
    numberReports: number | null;
}, {
    reports: Omit<Report.Flatten, 'discordMessageId'>[];
    hasMore: boolean;
}>;
