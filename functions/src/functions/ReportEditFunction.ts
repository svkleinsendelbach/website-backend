import { type DatabaseType, type IFirebaseFunction, type ILogger, ParameterBuilder, Guid, ParameterParser, type IFunctionType, HttpsError, CryptedScheme, IDatabaseReference, IParameterContainer, GuardParameterBuilder, NullableParameterBuilder } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkUserRoles } from '../checkUserRoles';
import { DatabaseScheme } from '../DatabaseScheme';
import { EditType } from '../types/EditType';
import { Report, ReportGroupId } from '../types/Report';
import { Discord } from '../Discord';
import { discordKeys } from '../privateKeys';

export class ReportEditFunction implements IFirebaseFunction<ReportEditFunctionType> {
    public readonly parameters: IFunctionType.Parameters<ReportEditFunctionType> & { databaseType: DatabaseType };

    public constructor(
        parameterContainer: IParameterContainer, 
        private readonly auth: AuthData | null, 
        private readonly databaseReference: IDatabaseReference<DatabaseScheme>, 
        private readonly logger: ILogger
    ) {
        this.logger.log('ReportEditFunction.constructor', { auth: auth }, 'notice');
        const parameterParser = new ParameterParser<IFunctionType.Parameters<ReportEditFunctionType>>(
            {
                editType: new GuardParameterBuilder('string', EditType.typeGuard),
                groupId: new GuardParameterBuilder('string', ReportGroupId.typeGuard),
                previousGroupId: new NullableParameterBuilder(new GuardParameterBuilder('string', ReportGroupId.typeGuard)),
                reportId: new ParameterBuilder('string', Guid.fromString),
                report: new NullableParameterBuilder(new ParameterBuilder('object', Report.fromObject))
            },
            this.logger.nextIndent
        );
        parameterParser.parse(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async execute(): Promise<IFunctionType.ReturnType<ReportEditFunctionType>> {
        this.logger.log('ReportEditFunction.executeFunction', {}, 'info');
        await checkUserRoles(this.auth, 'websiteManager', this.databaseReference, this.logger);
        switch (this.parameters.editType) {
            case 'add':
                return await this.addReport();
            case 'change':
                return await this.changeReport();
            case 'remove':
                return await this.removeReport();
        }
    }

    private get reference(): IDatabaseReference<CryptedScheme<Omit<Report.Flatten, 'id'>>> {
        return this.databaseReference.child('reports').child(this.parameters.groupId).child(this.parameters.reportId.guidString);
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
        const report = this.parameters.report;
        const discordMessageId = await Discord.execute(this.parameters.databaseType, async discord => {
            return await discord.add(discordKeys.channelIds.reports, { embeds: [Report.discordEmbed(report, this.parameters.groupId)] });
        }, null);
        await this.reference.set(Report.flatten(Report.addDiscordMessageId(report, discordMessageId)), 'encrypt');
    }

    private async changeReport() {
        if (!this.parameters.report)
            throw HttpsError('invalid-argument', 'No report in parameters to change.', this.logger);
        const databaseReport = await this.removePreviousReport();
        if (!databaseReport)
            throw HttpsError('invalid-argument', 'Couldn\'t change not existing report.', this.logger);
        const report = Report.addDiscordMessageId(this.parameters.report, databaseReport.discordMessageId);
        void Discord.execute(this.parameters.databaseType, async discord => {
            await discord.change(discordKeys.channelIds.reports, report.discordMessageId, { embeds: [Report.discordEmbed(report, this.parameters.groupId)] });
        });
        await this.reference.set(Report.flatten(report), 'encrypt');
    }

    private async removePreviousReport(): Promise<Omit<Report, "id">> {
        if (!this.parameters.previousGroupId)
            throw HttpsError('invalid-argument', 'No previous group id in parameters to change.', this.logger);
        const previousReference = this.databaseReference.child('reports').child(this.parameters.previousGroupId).child(this.parameters.reportId.guidString);
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
            await discord.remove(discordKeys.channelIds.reports, databaseReport.discordMessageId);
        });
        await this.reference.remove();
    }
}

export type ReportEditFunctionType = IFunctionType<{
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
