import { type DatabaseType, type FirebaseRequest, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, type FunctionType } from 'firebase-function';
import { Event, EventGroup, EventGroupId } from '../types/Event';
import ical from 'ical-generator';
import { DatabaseScheme } from '../DatabaseScheme';

export class IcsEventsRequest implements FirebaseRequest<IcsEventsRequestType> {
    public readonly parameters: FunctionType.Parameters<IcsEventsRequestType> & { databaseType: DatabaseType };

    public constructor(parameters: Record<string, unknown> & { databaseType: DatabaseType }, private readonly logger: ILogger) {
        this.logger.log('IcsEventsRequest.constructor', { parameters: parameters }, 'notice');
        const parameterContainer = new ParameterContainer(parameters, 'uncrypted', this.logger.nextIndent);
        const parameterParser = new ParameterParser<FunctionType.Parameters<IcsEventsRequestType>>(
            {
                selection: ParameterBuilder.build('string', EventGroupId.decodeSelectedGroupIds)
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<IcsEventsRequestType>> {
        this.logger.log('IcsEventsRequest.executeFunction', {}, 'info');
        const eventGroups = (await Promise.all(this.parameters.selection.map(async groupId => await this.getEventGroup(groupId)))).flatMap(eventGroup => eventGroup ?? []);
        return this.calendar(eventGroups);
    }

    private async getEventGroup(id: EventGroupId): Promise<EventGroup | null> {
        const reference = DatabaseScheme.reference(this.parameters.databaseType).child('events').child(id);
        const snapshot = await reference.snapshot();
        if (!snapshot.exists)
            return null;
        return {
            groupId: id,
            events: snapshot.compactMap(snapshot => {
                if (snapshot.key === null)
                    return null;
                return Event.concrete({
                    ...snapshot.value('decrypt'),
                    id: snapshot.key
                });
            })
        };
    }

    private calendar(eventGroups: EventGroup[]): string {
        const calender = ical({
            description: `Exportierter Kalender von der SV Kleinsendelbach Website für ${eventGroups.map(eventGroup => EventGroupId.title[eventGroup.groupId]).join(', ')}`,
            name: eventGroups.length === 1 ? EventGroupId.title[eventGroups[0].groupId] : 'SV Kleinsendelbach',
            timezone: 'Europe/Berlin'
        });
        for (const eventGroup of eventGroups) {
            for (const event of eventGroup.events) {
                calender.createEvent({
                    categories: [
                        {
                            name: eventGroup.groupId
                        }
                    ],
                    description: event.subtitle,
                    end: event.date.advanced({ hour: 1, minute: 30 }).toDate,
                    id: event.id.guidString,
                    start: event.date.toDate,
                    summary: event.title,
                    timezone: 'Europe/Berlin',
                    url: event.link
                });
            }
        }
        return calender.toString();
    }
}

export type IcsEventsRequestType = FunctionType<{
    selection: EventGroupId[];
}, string, {
    selection: string;
}>;
