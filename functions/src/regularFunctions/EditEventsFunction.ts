import { AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkPrerequirements, checkUserAuthentication } from '../utils/checkPrerequirements';
import { DatabaseType } from '../classes/DatabaseType';
import { FiatShamirParameters } from '../utils/fiatShamir';
import { FirebaseFunction } from '../utils/FirebaseFunction';
import { Logger } from '../utils/Logger';
import { ParameterContainer } from '../utils/Parameter/ParameterContainer';
import { ParameterParser } from '../utils/Parameter/ParameterParser';
import { EditType } from '../classes/EditType';
import { ParameterBuilder } from '../utils/Parameter/ParameterBuilder';
import { Event, EventGroupId } from '../classes/Event';
import { guid } from '../classes/guid';
import { httpsError, mapObject } from '../utils/utils';
import { FirebaseDatabase } from '../utils/FirebaseDatabase';

export class EditEventsFunction implements FirebaseFunction<
    EditEventsFunction.Parameters,
    EditEventsFunction.ReturnType
> {

    public parameters: EditEventsFunction.Parameters;

    private logger: Logger;

    public constructor(data: any, private auth: AuthData | undefined) {
        this.logger = Logger.start(!!data.verbose, 'EditEventsFunction.constructor', { data, auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, this.logger.nextIndent);
        const parameterParser = new ParameterParser<EditEventsFunction.Parameters>(
            {
                fiatShamirParameters: ParameterBuilder.builder('object', FiatShamirParameters.fromObject),
                databaseType: ParameterBuilder.builder('string', DatabaseType.fromString),
                editType: ParameterBuilder.builder('string', EditType.fromString),
                groupId: ParameterBuilder.builder('string', (value: string, logger: Logger) => { 
                    if (!EventGroupId.isValid(value)) 
                        throw httpsError('invalid-argument', 'Invalid event group id.', logger);
                    return value;
                }),
                eventId: ParameterBuilder.builder('string', guid.fromString),
                event: ParameterBuilder.optionalBuilder(ParameterBuilder.builder('object', Event.fromObject))
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<EditEventsFunction.ReturnType> {
        this.logger.log('EditEventsFunction.executeFunction', {}, 'info');
        await checkPrerequirements(this.parameters, this.logger.nextIndent, this.auth); 
        await checkUserAuthentication(this.auth, 'websiteEditing', this.parameters.databaseType, this.logger.nextIndent);

        const reference = FirebaseDatabase.Reference.fromPath(`events/${this.parameters.groupId}/${this.parameters.eventId.guidString}`, this.parameters.databaseType);
        const snapshot = await reference.snapshot();
        if (this.parameters.editType.value === 'remove') {
            if (snapshot.exists)
                reference.remove();
        } else {
            if (this.parameters.event === undefined)
                throw httpsError('invalid-argument', 'No event to set.', this.logger);
            reference.set(mapObject(this.parameters.event, 'date', date => date.toISOString()));
        }
    }
}

export namespace EditEventsFunction {
    export type Parameters = FirebaseFunction.DefaultParameters & {
        editType: EditType,
        groupId: EventGroupId,
        eventId: guid,
        event: Omit<Event, 'id'> | undefined
    }

    export type ReturnType = void;
}
