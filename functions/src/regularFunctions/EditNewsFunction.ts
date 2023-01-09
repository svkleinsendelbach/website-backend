import { AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkPrerequirements, checkUserAuthentication } from '../utils/checkPrerequirements';
import { DatabaseType } from '../classes/DatabaseType';
import { FirebaseFunction } from '../utils/FirebaseFunction';
import { Logger } from '../utils/Logger';
import { ParameterContainer } from '../utils/Parameter/ParameterContainer';
import { ParameterParser } from '../utils/Parameter/ParameterParser';
import { ParameterBuilder } from '../utils/Parameter/ParameterBuilder';
import { EditType } from '../classes/EditType';
import { News } from '../classes/News';
import { FirebaseDatabase } from '../utils/FirebaseDatabase';
import { httpsError, mapObject } from '../utils/utils';
import { FiatShamirParameters } from '../classes/FiatShamirParameters';

export class EditNewsFunction implements FirebaseFunction<
    EditNewsFunction.Parameters,
    EditNewsFunction.ReturnType
> {

    public parameters: EditNewsFunction.Parameters;

    private logger: Logger;

    public constructor(data: any, private auth: AuthData | undefined) {
        this.logger = Logger.start(data.verbose, 'EditNewsFunction.constructor', { data, auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, this.logger.nextIndent);
        const parameterParser = new ParameterParser<EditNewsFunction.Parameters>(
            {
                fiatShamirParameters: ParameterBuilder.builder('object', FiatShamirParameters.fromObject),
                databaseType: ParameterBuilder.builder('string', DatabaseType.fromString),
                editType: ParameterBuilder.builder('string', EditType.fromString),
                id: ParameterBuilder.trivialBuilder('string'),
                news: ParameterBuilder.optionalBuilder(ParameterBuilder.builder('object', News.fromObject))
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<EditNewsFunction.ReturnType> {
        this.logger.log('EditNewsFunction.executeFunction', {}, 'info');
        await checkPrerequirements(this.parameters, this.logger.nextIndent, this.auth); 
        await checkUserAuthentication(this.auth, 'websiteEditing', this.parameters.databaseType, this.logger.nextIndent);

        const id = await this.getIdOfNews();
        const reference = FirebaseDatabase.Reference.fromPath(`news/${id}`, this.parameters.databaseType);
        const snapshot = await reference.snapshot();
        if (this.parameters.editType.value === 'remove') {
            if (snapshot.exists)
                reference.remove();
        } else {
            if (this.parameters.news === undefined)
                throw httpsError('invalid-argument', 'No news to set.', this.logger);
            if (this.parameters.editType.value === 'change' && !snapshot.exists)
                throw httpsError('invalid-argument', 'Couldn\'t change not existing news.', this.logger);
            await reference.set(mapObject(this.parameters.news, 'date', date => date.toISOString()));
        }
        return id;
    }

    private async getIdOfNews(): Promise<string> {
        this.logger.log('EditNewsFunction.getIdOfNews');
        if (this.parameters.editType.value !== 'add')
            return this.parameters.id;
        const reference = FirebaseDatabase.Reference.fromPath('news', this.parameters.databaseType);
        const snapshot = await reference.snapshot<Omit<News, 'id'>[]>();
        const alreadyUsedIds: ['unused' | 'used', ...number[]] = ['unused'];
        snapshot.forEach(snapshot => {
            if (snapshot.key === null) return;
            if (snapshot.key === this.parameters.id) {
                alreadyUsedIds[0] = 'used';
                return;
            }
            const regex = new RegExp(`^${this.parameters.id}_(?<i>\\d+)$`);
            const i = regex.exec(snapshot.key)?.groups?.i;
            if (i !== undefined)
                alreadyUsedIds.push(Number.parseInt(i));
        });
        const suffix = this.getIdSuffix(alreadyUsedIds);
        return this.parameters.id + suffix;
    }

    private getIdSuffix(alreadyUsedIds: ['unused' | 'used', ...number[]]): string {
        if (alreadyUsedIds[0] === 'unused') 
            return '';
        let index = 2;
        while (true) {
            if (!alreadyUsedIds.slice(1).includes(index))
                return `_${index}`;
            index += 1;
        }
    }
}

export namespace EditNewsFunction {
    export type Parameters = FirebaseFunction.DefaultParameters & {
        editType: EditType,
        id: string,
        news: Omit<News, 'id'> | undefined        
    }

    export type ReturnType = string;

    export type CallParameters = {
        editType: EditType.Value,
        id: string,
        news: News.CallParameters | undefined
    }
}
