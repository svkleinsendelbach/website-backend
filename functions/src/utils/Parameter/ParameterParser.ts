import { Logger } from '../Logger';
import { ParameterBuilder } from './ParameterBuilder';
import { TrivialParameterType } from './TrivialParameterType';
import { ParameterContainer } from './ParameterContainer';
import { httpsError } from '../utils';

export type ParameterBuilders<Parameters> = {
    [Key in keyof Parameters]: ParameterBuilder<TrivialParameterType, Parameters[Key]>
};

export class ParameterParser<Parameters> {

    private initialParameters?: Parameters;

    public constructor(
        private readonly typesOrBuilders: ParameterBuilders<Parameters>, 
        private readonly logger: Logger
    ) {}

    public get parameters(): Parameters {
        if (this.initialParameters === undefined)
            throw httpsError('internal', 'Tried to access parameters before those parameters were parsed.', this.logger);
        return this.initialParameters;
    }

    public parseParameters(container: ParameterContainer): void {
        this.logger.log('ParameterParser.parseParameters', { container });
        this.initialParameters = {} as any;
        for (const entry of Object.entries(this.typesOrBuilders))
            (this.initialParameters as any)[entry[0]] = container.parameter(entry[0], entry[1] as ParameterBuilder<TrivialParameterType, unknown>, this.logger.nextIndent);
    }
}
