import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, type FunctionType } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { getPrivateKeys } from '../privateKeys';
import { UtcDate } from '../types/UtcDate';
import { baseDatabaseReference } from '../utils';
import { Report, ReportGroupId } from '../types/Report';

export class ReportGetChangesFunction implements FirebaseFunction<ReportGetChangesFunctionType> {
    public readonly parameters: FunctionType.Parameters<ReportGetChangesFunctionType> & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('ReportGetChangesFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getPrivateKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<FunctionType.Parameters<ReportGetChangesFunctionType>>(
            {
                groupIds: ParameterBuilder.array(ParameterBuilder.guard('string', ReportGroupId.typeGuard)),
                upToDate: ParameterBuilder.build('string', UtcDate.decode)
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<ReportGetChangesFunctionType>> {
        this.logger.log('ReportGetChangesFunction.executeFunction', {}, 'info');
        const dates = UtcDate.iterateDates(this.parameters.upToDate);
        const reference = baseDatabaseReference(this.parameters.databaseType).child('reports');
        return await Promise.all(this.parameters.groupIds.map(async groupId => {
            const ids = (await Promise.all(dates.map(async date => {
                const snapshot = await reference.child(groupId).child('changes').child(date.encoded).snapshot();
                if (!snapshot.exists)
                    return [];
                return Object.values(snapshot.value()); 
            }))).flatMap(ids => ids).filter((value, index, array) => array.indexOf(value) === index);
            const reports = await Promise.all(ids.map(async id => {
                const snapshot = await reference.child(groupId).child(id).snapshot();
                if (!snapshot.exists)
                    return {
                        id: snapshot.key!,
                        state: 'deleted' as const
                    };
                return {
                    id: snapshot.key!,
                    ...snapshot.value('decrypt')
                };
            }));
            return {
                groupId: groupId,
                reports: reports
            };
        }));
    }
}

export type ReportGetChangesFunctionType = FunctionType<{
    groupIds: ReportGroupId[];
    upToDate: UtcDate;
}, {
    groupId: ReportGroupId;
    reports: (Report.Flatten | { id: string; state: 'deleted' })[];
}[], {
    groupIds: ReportGroupId[];
    upToDate: string;
}>;
