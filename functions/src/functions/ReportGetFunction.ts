import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, type FunctionType, DatabaseReference } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { type DatabaseScheme } from '../DatabaseScheme';
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
                numberReports: ParameterBuilder.optional(ParameterBuilder.value('number'))
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<ReportGetFunctionType>> {
        this.logger.log('ReportGetFunction.executeFunction', {}, 'info');
        const reference = DatabaseReference.base<DatabaseScheme>(getPrivateKeys(this.parameters.databaseType)).child('reports').child(this.parameters.groupId);
        const snapshot = await reference.snapshot();
        if (!snapshot.exists || !snapshot.hasChildren)
            return { reports: [], hasMore: false };
        const reports = snapshot.compactMap<Report.Flatten>(snapshot => {
            if (snapshot.key === null)
                return undefined;
            return {
                ...snapshot.value('decrypt'),
                id: snapshot.key
            };
        });
        reports.sort((a, b) => new Date(a.createDate) > new Date(b.createDate) ? -1 : 1);
        if (this.parameters.numberReports === undefined)
            return { reports: reports, hasMore: false };
        const reportsToReturn: Report.Flatten[] = [];
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
    numberReports: number | undefined;
}, {
    reports: Report.Flatten[];
    hasMore: boolean;
}>;
