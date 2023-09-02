import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, DatabaseReference, type FunctionType, UtcDate } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { type DatabaseScheme } from '../DatabaseScheme';
import { getPrivateKeys } from '../privateKeys';
import { EventGroupId, type Event, type EventGroup } from '../types/Event';

export class EventGetFunction implements FirebaseFunction<EventGetFunctionType> {
    public readonly parameters: FunctionType.Parameters<EventGetFunctionType> & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('EventGetFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getPrivateKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<FunctionType.Parameters<EventGetFunctionType>>(
            {
                groupIds: ParameterBuilder.array(ParameterBuilder.guard('string', EventGroupId.typeGuard))
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<EventGetFunctionType>> {
        this.logger.log('EventGetFunction.executeFunction', {}, 'info');
        return (await Promise.all(this.parameters.groupIds.map(async id => await this.getEventGroup(id)))).flatMap(eventGroup => eventGroup ?? []);
    }

    private async getEventGroup(groupId: EventGroupId): Promise<EventGroup.Flatten | null> {
        const reference = DatabaseReference.base<DatabaseScheme>(getPrivateKeys(this.parameters.databaseType)).child('events').child(groupId);
        const snapshot = await reference.snapshot();
        if (!snapshot.exists || !snapshot.hasChildren)
            return null;
        const events = snapshot.compactMap<Event.Flatten>(snapshot => {
            if (snapshot.key === null)
                return null;
            const event = snapshot.value('decrypt');
            const date = UtcDate.decode(event.date);
            if (date.compare(UtcDate.now) === 'less')
                return null;
            return {
                ...event,
                id: snapshot.key
            };
        });
        if (events.length === 0)
            return null;
        events.sort((a, b) => UtcDate.decode(a.date).compare(UtcDate.decode(b.date)) === 'less' ? -1 : 1);
        return {
            groupId: groupId,
            events: events
        };
    }
}

export type EventGetFunctionType = FunctionType<{
    groupIds: EventGroupId[];
}, EventGroup.Flatten[]>;
