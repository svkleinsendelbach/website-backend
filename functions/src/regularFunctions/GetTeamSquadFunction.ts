import { AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkPrerequirements } from '../utils/checkPrerequirements';
import { DatabaseType } from '../classes/DatabaseType';
import { FiatShamirParameters } from '../classes/FiatShamirParameters';
import { FirebaseFunction } from '../utils/FirebaseFunction';
import { Logger } from '../utils/Logger';
import { ParameterContainer } from '../utils/Parameter/ParameterContainer';
import { ParameterParser } from '../utils/Parameter/ParameterParser';
import { ParameterBuilder } from '../utils/Parameter/ParameterBuilder';
import { AnpfiffTeamParameter, getAnpfiffTeamParameter } from '../utils/anpfiffTeamParameter';
import { TeamSquad } from '../WebsiteExtractor/TeamSquad/TeamSquad';
import { WebsiteFetcher } from '../WebsiteExtractor/WebsiteFetcher';
import { TeamSquadParser } from '../WebsiteExtractor/TeamSquad/TeamSquadParser';

export class GetTeamSquadFunction implements FirebaseFunction<
    GetTeamSquadFunction.Parameters,
    GetTeamSquadFunction.ReturnType
> {

    public parameters: GetTeamSquadFunction.Parameters;

    private logger: Logger;

    public constructor(data: any, auth: AuthData | undefined) {
        this.logger = Logger.start(data.verbose, 'GetTeamSquadFunction.constructor', { data, auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, this.logger.nextIndent);
        const parameterParser = new ParameterParser<GetTeamSquadFunction.Parameters>(
            {
                fiatShamirParameters: ParameterBuilder.builder('object', FiatShamirParameters.fromObject),
                databaseType: ParameterBuilder.builder('string', DatabaseType.fromString),
                type: ParameterBuilder.guardBuilder('string', AnpfiffTeamParameter.Type.typeGuard)
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<GetTeamSquadFunction.ReturnType> {
        this.logger.log('GetTeamSquadFunction.executeFunction', {}, 'info');
        await checkPrerequirements(this.parameters, this.logger.nextIndent, 'notRequired');
        const anpfiffTeamParameter = await getAnpfiffTeamParameter(this.parameters.type, this.parameters.databaseType, this.logger.nextIndent);
        const url = `http://www.anpfiff.info/sites/team/kader.aspx?SK=${anpfiffTeamParameter.spielkreis}&Lg=${anpfiffTeamParameter.ligaId}&Tm=${anpfiffTeamParameter.teamId}&Ver=${anpfiffTeamParameter.vereinId}&Sais=${anpfiffTeamParameter.saisonId}&Men=${anpfiffTeamParameter.men}`;
        const dom = await new WebsiteFetcher(url).fetch();
        return new TeamSquadParser(dom).parse(); 
    }
}

export namespace GetTeamSquadFunction {
    export type Parameters = FirebaseFunction.DefaultParameters & {
        type: AnpfiffTeamParameter.Type
    }

    export type ReturnType = TeamSquad;

    export type CallParameters = {
        type: AnpfiffTeamParameter.Type
    }
}
