import { type DatabaseType, type IFirebaseFunction, type ILogger, ParameterParser, WebsiteFetcher, type IFunctionType, IParameterContainer, IDatabaseReference, GuardParameterBuilder } from 'firebase-function';
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
        private readonly databaseReference: IDatabaseReference<DatabaseScheme>, 
        private readonly logger: ILogger
    ) {
        this.logger.log('TeamSquadGetFunction.constructor', { auth: auth }, 'notice');
        const parameterParser = new ParameterParser<IFunctionType.Parameters<TeamSquadGetFunctionType>>(
            {
                type: new GuardParameterBuilder('string', AnpfiffInfoTeamParameters.Type.typeGuard)
            },
            this.logger.nextIndent
        );
        parameterParser.parse(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async execute(): Promise<IFunctionType.ReturnType<TeamSquadGetFunctionType>> {
        this.logger.log('TeamSquadGetFunction.executeFunction', {}, 'info');
        const anpfiffInfoTeamParameters = await AnpfiffInfoTeamParameters.fetchFromDatabase(this.parameters.type, this.databaseReference, this.logger.nextIndent);
        const url = `http://www.anpfiff.info/sites/team/kader.aspx?SK=${anpfiffInfoTeamParameters.spielkreis}&Lg=${anpfiffInfoTeamParameters.ligaId}&Tm=${anpfiffInfoTeamParameters.teamId}&Ver=${anpfiffInfoTeamParameters.vereinId}&Sais=${anpfiffInfoTeamParameters.saisonId}&Men=${anpfiffInfoTeamParameters.men}`;
        const dom = await new WebsiteFetcher(url).fetch();
        return new TeamSquadParser(dom).parse();
    }
}

export type TeamSquadGetFunctionType = IFunctionType<{
    type: AnpfiffInfoTeamParameters.Type;
}, TeamSquad>;
