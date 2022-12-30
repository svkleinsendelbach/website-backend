import { AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { EventGroupId, EventGroup, Event } from '../classes/Event';
import { Crypter } from '../crypter/Crypter';
import { cryptionKeys } from '../privateKeys';
import { checkPrerequirements } from '../utils/checkPrerequirements';
import { DatabaseType } from '../classes/DatabaseType';
import { FiatShamirParameters } from '../utils/fiatShamir';
import { FirebaseFunction } from '../utils/FirebaseFunction';
import { Logger } from '../utils/Logger';
import { ParameterContainer } from '../utils/Parameter/ParameterContainer';
import { ParameterParser } from '../utils/Parameter/ParameterParser';
import { arrayBuilder, httpsError, reference } from '../utils/utils';
import { ParameterBuilder } from '../utils/Parameter/ParameterBuilder';

export class GetEventsFunction implements FirebaseFunction<
    GetEventsFunction.Parameters,
    GetEventsFunction.ReturnType
> {

    public parameters: GetEventsFunction.Parameters;

    private logger: Logger;
    
    public constructor(data: any, auth: AuthData | undefined) {
        this.logger = Logger.start(!!data.verbose, 'GetEventsFunction.constructor', { data, auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, this.logger.nextIndent);
        const parameterParser = new ParameterParser<GetEventsFunction.Parameters>(
            {
                fiatShamirParameters: ParameterBuilder.builder('object', FiatShamirParameters.fromObject),
                databaseType: ParameterBuilder.builder('string', DatabaseType.fromString),
                groupIds: ParameterBuilder.builder('object', arrayBuilder((element: any, logger: Logger) => {
                    if (!EventGroupId.isValid(element))
                        throw httpsError('invalid-argument', `group id '${element}' is not a valid event group id.`, logger);
                    return element;
                }))
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }
    
    public async executeFunction(): Promise<GetEventsFunction.ReturnType> {
        this.logger.append('GetEventsFunction.executeFunction', {}, 'info');
        await checkPrerequirements(this.parameters, this.logger.nextIndent, 'notRequired');   
        const events = await Promise.all(this.parameters.groupIds.map(e => this.getEvents(e)));
        return events.compactMap(event => event);     
    }

    private async getEvents(groupId: EventGroupId): Promise<EventGroup | undefined> {
        const crypter = new Crypter(cryptionKeys(this.parameters.databaseType));
        const eventsRef = reference(`events/${groupId}`, this.parameters.databaseType, this.logger.nextIndent);
        const eventsSnapshot = await eventsRef.once('value');
        if (!eventsSnapshot.exists() || eventsSnapshot.hasChildren())
            return undefined;
        const events = Object
            .entries<string>(eventsSnapshot.val())
            .compactMap<Event>(entry => {
                const event: Omit<Event, 'id'> = crypter.decryptDecode(entry[1]);
                const date = new Date(event.date);
                if (date < new Date()) 
                    return undefined;
                return { 
                    ...event, 
                    date: date,
                    id: entry[0] 
                };
            });
        if (events.length === 0) 
            return undefined;
        events.sort((a, b) => (new Date(a.date) < new Date(b.date) ? -1 : 1));
        return { 
            groupId: groupId,
            events: events 
        };
    }
}

export namespace GetEventsFunction {
    export type Parameters = FirebaseFunction.DefaultParameters & {
        groupIds: EventGroupId[]
    }

    export type ReturnType = EventGroup[];
}
