import { AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkPrerequirements, checkUserAuthentication } from '../utils/checkPrerequirements';
import { DatabaseType } from '../classes/DatabaseType';
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
import { FiatShamirParameters } from '../classes/FiatShamirParameters';

export class EditEventFunction implements FirebaseFunction<
    EditEventFunction.Parameters,
    EditEventFunction.ReturnType
> {

    public parameters: EditEventFunction.Parameters;

    private logger: Logger;

    public constructor(data: any, private auth: AuthData | undefined) {
        this.logger = Logger.start(!!data.verbose, 'EditEventFunction.constructor', { data, auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, this.logger.nextIndent);
        const parameterParser = new ParameterParser<EditEventFunction.Parameters>(
            {
                fiatShamirParameters: ParameterBuilder.builder('object', FiatShamirParameters.fromObject),
                databaseType: ParameterBuilder.builder('string', DatabaseType.fromString),
                editType: ParameterBuilder.builder('string', EditType.fromString),
                groupId: ParameterBuilder.guardBuilder('string', EventGroupId.isValid),
                eventId: ParameterBuilder.builder('string', guid.fromString),
                event: ParameterBuilder.optionalBuilder(ParameterBuilder.builder('object', Event.fromObject))
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<EditEventFunction.ReturnType> {
        this.logger.log('EditEventFunction.executeFunction', {}, 'info');
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
            if (this.parameters.editType.value === 'add' && snapshot.exists)
                throw httpsError('invalid-argument', 'Couldn\'t add existing event.', this.logger);
            if (this.parameters.editType.value === 'change' && !snapshot.exists)
                throw httpsError('invalid-argument', 'Couldn\'t change not existing event.', this.logger);
            await reference.set(mapObject(this.parameters.event, 'date', date => date.toISOString()));
        }
    }
}

export namespace EditEventFunction {
    export type Parameters = FirebaseFunction.DefaultParameters & {
        editType: EditType,
        groupId: EventGroupId,
        eventId: guid,
        event: Omit<Event, 'id'> | undefined
    }

    export type ReturnType = void;

    export type CallParameters = {
        editType: EditType.Value,
        groupId: EventGroupId,
        eventId: string,
        event: Event.CallParameters | undefined
    }
}
