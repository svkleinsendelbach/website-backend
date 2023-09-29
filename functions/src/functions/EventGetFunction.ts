import { type DatabaseType, type IFirebaseFunction, type ILogger, ParameterParser, type IFunctionType, UtcDate, IParameterContainer, IDatabaseReference, ArrayParameterBuilder, GuardParameterBuilder } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { DatabaseScheme } from '../DatabaseScheme';
import { EventGroupId, type Event, type EventGroup } from '../types/Event';

export class EventGetFunction implements IFirebaseFunction<EventGetFunctionType> {
    public readonly parameters: IFunctionType.Parameters<EventGetFunctionType> & { databaseType: DatabaseType };

    public constructor(
        parameterContainer: IParameterContainer, 
        auth: AuthData | null, 
        private readonly databaseReference: IDatabaseReference<DatabaseScheme>, 
        private readonly logger: ILogger
    ) {
        this.logger.log('EventGetFunction.constructor', { auth: auth }, 'notice');
        const parameterParser = new ParameterParser<IFunctionType.Parameters<EventGetFunctionType>>(
            {
                groupIds: new ArrayParameterBuilder(new GuardParameterBuilder('string', EventGroupId.typeGuard))
            },
            this.logger.nextIndent
        );
        parameterParser.parse(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async execute(): Promise<IFunctionType.ReturnType<EventGetFunctionType>> {
        this.logger.log('EventGetFunction.executeFunction', {}, 'info');
        return (await Promise.all(this.parameters.groupIds.map(async id => await this.getEventGroup(id)))).flatMap(eventGroup => eventGroup ?? []);
    }

    private async getEventGroup(groupId: EventGroupId): Promise<EventGroup.Flatten | null> {
        const reference = this.databaseReference.child('events').child(groupId);
        const snapshot = await reference.snapshot();
        if (!snapshot.exists || !snapshot.hasChildren)
            return null;
        const events = snapshot.compactMap<Omit<Event.Flatten, 'discordMessageId'>>(snapshot => {
            if (snapshot.key === null)
                return null;
            const event = snapshot.value('decrypt') as Omit<Event.Flatten, 'id' | 'discordMessageId'>;
            if ('discordMessageId' in event)
                delete event.discordMessageId;
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

export type EventGetFunctionType = IFunctionType<{
    groupIds: EventGroupId[];
}, EventGroup.Flatten[]>;
