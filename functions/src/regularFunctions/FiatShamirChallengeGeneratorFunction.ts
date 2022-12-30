import { AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { guid } from '../classes/guid';
import { Crypter } from '../crypter/Crypter';
import { cryptionKeys } from '../privateKeys';
import { DatabaseType } from '../classes/DatabaseType';
import { FirebaseFunction } from '../utils/FirebaseFunction';
import { Logger } from '../utils/Logger';
import { ParameterContainer } from '../utils/Parameter/ParameterContainer';
import { ParameterParser } from '../utils/Parameter/ParameterParser';
import { arrayBuilder, httpsError } from '../utils/utils';
import { ParameterBuilder } from '../utils/Parameter/ParameterBuilder';
import { FirebaseDatabase } from '../utils/FirebaseDatabase';

export class FiatShamirChallengeGeneratorFunction implements FirebaseFunction<
    FiatShamirChallengeGeneratorFunction.Parameters,
    FiatShamirChallengeGeneratorFunction.ReturnType
> {

    public parameters: FiatShamirChallengeGeneratorFunction.Parameters;

    private logger: Logger;

    public constructor(data: any, auth: AuthData | undefined) {
        this.logger = Logger.start(!!data.verbose, 'FiatShamirChallengeGeneratorFunction.constructor', { data, auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, this.logger.nextIndent);
        const parameterParser = new ParameterParser<FiatShamirChallengeGeneratorFunction.Parameters>(
            {
                databaseType: ParameterBuilder.builder('string', DatabaseType.fromString),
                identifier: ParameterBuilder.builder('string', guid.fromString),
                bs: ParameterBuilder.builder('object', arrayBuilder((element: any, logger: Logger) => {
                    if (typeof element !== 'bigint')
                        throw httpsError('invalid-argument', `b '${element}' is not a big int.`, logger);
                    return element;
                }, 32))
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FiatShamirChallengeGeneratorFunction.ReturnType> {
        this.logger.log('FiatShamirChallengeGeneratorFunction.executeFunction', {}, 'info');
        const crypter = new Crypter(cryptionKeys(this.parameters.databaseType));
        const challenges = this.generateChallenges();
        const encrypedBsAndChallenges = crypter.encodeEncrypt({
            bs: this.parameters.bs,
            challenges: challenges,
            expireDate: new Date(new Date().getTime() + 300000) // + 5 minutes
        });
        const reference = FirebaseDatabase.Reference.fromPath(`fiatShamir/${this.parameters.identifier.guidString}`, this.parameters.databaseType);
        await reference.set(encrypedBsAndChallenges);
        return challenges;
    }

    private generateChallenges(): (0 | 1)[] {
        const challenges: (0 | 1)[] = [];
        for (let i = 0; i < 32; i++)
            challenges.push(Math.random() < 0.5 ? 0 : 1);
        return challenges;
    }
}

export namespace FiatShamirChallengeGeneratorFunction {
    export interface Parameters {
        databaseType: DatabaseType,
        identifier: guid,
        bs: bigint[]
    }

    export type ReturnType = (0 | 1)[];
}
