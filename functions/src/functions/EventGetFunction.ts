import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, DatabaseReference } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { type DatabaseScheme } from '../DatabaseScheme';
import { getCryptionKeys, getDatabaseUrl } from '../privateKeys';
import { EventGroupId, type Event, type EventGroup } from '../types/Event';

export class EventGetFunction implements FirebaseFunction<EventGetFunction.Parameters, EventGetFunction.ReturnType> {
    public readonly parameters: EventGetFunction.Parameters & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('EventGetFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getCryptionKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<EventGetFunction.Parameters>(
            {
                groupIds: ParameterBuilder.array(ParameterBuilder.guard('string', EventGroupId.typeGuard))
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<EventGetFunction.ReturnType> {
        this.logger.log('EventGetFunction.executeFunction', {}, 'info');
        return (await Promise.all(this.parameters.groupIds.map(async id => await this.getEventGroup(id)))).flatMap(eventGroup => eventGroup ?? []);
    }

    private async getEventGroup(groupId: EventGroupId): Promise<EventGroup.Flatten | undefined> {
        const reference = DatabaseReference.base<DatabaseScheme>(getDatabaseUrl(this.parameters.databaseType), getCryptionKeys(this.parameters.databaseType)).child('events').child(groupId);
        const snapshot = await reference.snapshot();
        if (!snapshot.exists || !snapshot.hasChildren)
            return undefined;
        const events = snapshot.compactMap<Event.Flatten>(snapshot => {
            if (snapshot.key === null)
                return undefined;
            const event = snapshot.value(true);
            const date = new Date(event.date);
            if (date < new Date())
                return undefined;
            return {
                ...event,
                id: snapshot.key
            };
        });
        if (events.length === 0)
            return undefined;
        events.sort((a, b) => new Date(a.date) < new Date(b.date) ? -1 : 1);
        return {
            groupId: groupId,
            events: events
        };
    }
}

export namespace EventGetFunction {
    export type Parameters = {
        groupIds: EventGroupId[];
    };

    export type ReturnType = EventGroup.Flatten[];
}
