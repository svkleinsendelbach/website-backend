import { type DatabaseType, type IFirebaseFunction, type ILogger, ParameterParser, UtcDate, type IFunctionType, IDatabaseReference, IParameterContainer, GuardParameterBuilder, NullableParameterBuilder, ValueParameterBuilder } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { DatabaseScheme } from '../DatabaseScheme';
import { ReportGroupId, type Report } from '../types/Report';

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
                groupId: new GuardParameterBuilder('string', ReportGroupId.typeGuard),
                numberReports: new NullableParameterBuilder(new ValueParameterBuilder('number'))
            },
            this.logger.nextIndent
        );
        parameterParser.parse(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async execute(): Promise<IFunctionType.ReturnType<ReportGetFunctionType>> {
        this.logger.log('ReportGetFunction.executeFunction', {}, 'info');
        const reference = this.databaseReference.child('reports').child(this.parameters.groupId);
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

export type ReportGetFunctionType = IFunctionType<{
    groupId: ReportGroupId;
    numberReports: number | null;
}, {
    reports: Omit<Report.Flatten, 'discordMessageId'>[];
    hasMore: boolean;
}>;
