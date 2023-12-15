import { type DatabaseType, type IFirebaseFunction, type ILogger, ParameterParser, WebsiteFetcher, type IFunctionType, IParameterContainer, IDatabaseReference, ParameterBuilder } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { TeamSquadParser } from '../parsers/TeamSquadParser';
import { AnpfiffInfoTeamParameters } from '../types/AnpfiffInfoTeamParameters';
import { type TeamSquad } from '../types/TeamSquad';
import { DatabaseScheme } from '../DatabaseScheme';

export class TeamSquadGetFunction implements IFirebaseFunction<TeamSquadGetFunctionType> {
    public readonly parameters: IFunctionType.Parameters<TeamSquadGetFunctionType> & { databaseType: DatabaseType };

    public constructor(
        parameterContainer: IParameterContainer, 
        auth: AuthData | null, 
        databaseReference: IDatabaseReference<DatabaseScheme>, 
        private readonly logger: ILogger
    ) {
        this.logger.log('TeamSquadGetFunction.constructor', { auth: auth }, 'notice');
        const parameterParser = new ParameterParser<IFunctionType.Parameters<TeamSquadGetFunctionType>>(
            {
                anpfiffInfoTeamParameters: new ParameterBuilder('object', AnpfiffInfoTeamParameters.fromObject)
            },
            this.logger.nextIndent
        );
        parameterParser.parse(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async execute(): Promise<IFunctionType.ReturnType<TeamSquadGetFunctionType>> {
        this.logger.log('TeamSquadGetFunction.executeFunction', {}, 'info');
        const url = `http://www.anpfiff.info/sites/team/kader.aspx?SK=${this.parameters.anpfiffInfoTeamParameters.spielkreis}&Lg=${this.parameters.anpfiffInfoTeamParameters.ligaId}&Tm=${this.parameters.anpfiffInfoTeamParameters.teamId}&Ver=${this.parameters.anpfiffInfoTeamParameters.vereinId}&Sais=${this.parameters.anpfiffInfoTeamParameters.saisonId}&Men=${this.parameters.anpfiffInfoTeamParameters.men}`;
        const dom = await new WebsiteFetcher(url).fetch();
        return new TeamSquadParser(dom).parse();
    }
}

export type TeamSquadGetFunctionType = IFunctionType<{
    anpfiffInfoTeamParameters: AnpfiffInfoTeamParameters;
}, TeamSquad>;
