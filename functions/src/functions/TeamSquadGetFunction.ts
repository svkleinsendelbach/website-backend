import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, WebsiteFetcher } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { TeamSquadParser } from '../parsers/TeamSquadParser';
import { getCryptionKeys } from '../privateKeys';
import { AnpfiffInfoTeamParameters } from '../types/AnpfiffInfoTeamParameters';
import { type TeamSquad } from '../types/TeamSquad';

export class TeamSquadGetFunction implements FirebaseFunction<TeamSquadGetFunction.Parameters, TeamSquadGetFunction.ReturnType> {
    public readonly parameters: TeamSquadGetFunction.Parameters & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('TeamSquadGetFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getCryptionKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<TeamSquadGetFunction.Parameters>(
            {
                type: ParameterBuilder.guard('string', AnpfiffInfoTeamParameters.Type.typeGuard)
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<TeamSquadGetFunction.ReturnType> {
        this.logger.log('TeamSquadGetFunction.executeFunction', {}, 'info');
        const anpfiffInfoTeamParameters = await AnpfiffInfoTeamParameters.fetchFromDatabase(this.parameters.type, this.parameters.databaseType, this.logger.nextIndent);
        const url = `http://www.anpfiff.info/sites/team/kader.aspx?SK=${anpfiffInfoTeamParameters.spielkreis}&Lg=${anpfiffInfoTeamParameters.ligaId}&Tm=${anpfiffInfoTeamParameters.teamId}&Ver=${anpfiffInfoTeamParameters.vereinId}&Sais=${anpfiffInfoTeamParameters.saisonId}&Men=${anpfiffInfoTeamParameters.men}`;
        const dom = await new WebsiteFetcher(url).fetch();
        return new TeamSquadParser(dom).parse();
    }
}

export namespace TeamSquadGetFunction {
    export type Parameters = {
        type: AnpfiffInfoTeamParameters.Type;
    };

    export type ReturnType = TeamSquad;
}
