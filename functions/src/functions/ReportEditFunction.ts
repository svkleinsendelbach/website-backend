import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, type FunctionType, HttpsError, CryptedScheme, DatabaseReference } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkUserRoles } from '../checkUserRoles';
import { DatabaseScheme } from '../DatabaseScheme';
import { getPrivateKeys } from '../privateKeys';
import { EditType } from '../types/EditType';
import { Guid } from '../types/Guid';
import { Report, ReportGroupId } from '../types/Report';
import { Discord } from '../discord';

export class ReportEditFunction implements FirebaseFunction<ReportEditFunctionType> {
    public readonly parameters: FunctionType.Parameters<ReportEditFunctionType> & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, private readonly auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('ReportEditFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getPrivateKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<FunctionType.Parameters<ReportEditFunctionType>>(
            {
                editType: ParameterBuilder.guard('string', EditType.typeGuard),
                groupId: ParameterBuilder.guard('string', ReportGroupId.typeGuard),
                previousGroupId: ParameterBuilder.nullable(ParameterBuilder.guard('string', ReportGroupId.typeGuard)),
                reportId: ParameterBuilder.build('string', Guid.fromString),
                report: ParameterBuilder.nullable(ParameterBuilder.build('object', Report.fromObject))
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<ReportEditFunctionType>> {
        this.logger.log('ReportEditFunction.executeFunction', {}, 'info');
        await checkUserRoles(this.auth, 'websiteManager', this.parameters.databaseType, this.logger);
        switch (this.parameters.editType) {
            case 'add':
                return await this.addReport();
            case 'change':
                return await this.changeReport();
            case 'remove':
                return await this.removeReport();
        }
    }

    private get reference(): DatabaseReference<CryptedScheme<Omit<Report.Flatten, 'id'>>> {
        return DatabaseScheme.reference(this.parameters.databaseType).child('reports').child(this.parameters.groupId).child(this.parameters.reportId.guidString);
    }

    private async getDatabaseReport(): Promise<Omit<Report, 'id'> | null> {
        const snapshot = await this.reference.snapshot();
        if (!snapshot.exists)
            return null;
        return Report.concrete(snapshot.value('decrypt'));
    }

    private async addReport() {
        if (!this.parameters.report)
            throw HttpsError('invalid-argument', 'No report in parameters to add.', this.logger);
        const databaseReport = await this.getDatabaseReport();
        if (databaseReport)
            throw HttpsError('invalid-argument', 'Couldn\'t add existing report.', this.logger);
        let report = Report.addDiscordMessageId(this.parameters.report, null);
        report = await Discord.execute(this.parameters.databaseType, async discord => {
            return await discord.addReport(report, this.parameters.groupId);
        }, report);
        await this.reference.set(Report.flatten(report), 'encrypt');
    }

    private async changeReport() {
        if (!this.parameters.report)
            throw HttpsError('invalid-argument', 'No report in parameters to change.', this.logger);
        const databaseReport = await this.removePreviousReport();
        if (!databaseReport)
            throw HttpsError('invalid-argument', 'Couldn\'t change not existing report.', this.logger);
        const report = Report.addDiscordMessageId(this.parameters.report, databaseReport.discordMessageId);
        void Discord.execute(this.parameters.databaseType, async discord => {
            await discord.changeReport(report, this.parameters.groupId);
        });
        await this.reference.set(Report.flatten(report), 'encrypt');
    }

    private async removePreviousReport(): Promise<Omit<Report, "id">> {
        if (!this.parameters.previousGroupId)
            throw HttpsError('invalid-argument', 'No previous group id in parameters to change.', this.logger);
        const previousReference = DatabaseScheme.reference(this.parameters.databaseType).child('reports').child(this.parameters.previousGroupId).child(this.parameters.reportId.guidString);
        const previousSnapshot = await previousReference.snapshot();
        if (!previousSnapshot.exists)
            throw HttpsError('invalid-argument', 'Couldn\'t change not existing report.', this.logger);
        await previousReference.remove();
        return Report.concrete(previousSnapshot.value('decrypt'));
    }

    private async removeReport() {
        const databaseReport = await this.getDatabaseReport();
        if (!databaseReport)
            return;
        void Discord.execute(this.parameters.databaseType, async discord => {
            await discord.removeReport(databaseReport);
        });
        await this.reference.remove();
    }
}

export type ReportEditFunctionType = FunctionType<{
    editType: EditType;
    groupId: ReportGroupId;
    previousGroupId: ReportGroupId | null;
    reportId: Guid;
    report: Omit<Report, 'id' | 'discordMessageId'> | null;
}, void, {
    editType: EditType;
    groupId: ReportGroupId;
    previousGroupId: ReportGroupId | null;
    reportId: string;
    report: Omit<Report.Flatten, 'id' | 'discordMessageId'> | null;
}>;
