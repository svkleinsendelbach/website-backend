import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, type FunctionType } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { getPrivateKeys } from '../privateKeys';
import { UtcDate } from '../types/UtcDate';
import { Event, EventGroupId } from '../types/Event';
import { baseDatabaseReference } from '../utils';

export class EventGetChangesFunction implements FirebaseFunction<EventGetChangesFunctionType> {
    public readonly parameters: FunctionType.Parameters<EventGetChangesFunctionType> & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('EventGetChangesFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getPrivateKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<FunctionType.Parameters<EventGetChangesFunctionType>>(
            {
                groupIds: ParameterBuilder.array(ParameterBuilder.guard('string', EventGroupId.typeGuard)),
                upToDate: ParameterBuilder.build('string', UtcDate.decode)
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<EventGetChangesFunctionType>> {
        this.logger.log('EventGetChangesFunction.executeFunction', {}, 'info');
        const dates = UtcDate.iterateDates(this.parameters.upToDate);
        const reference = baseDatabaseReference(this.parameters.databaseType).child('events');
        return await Promise.all(this.parameters.groupIds.map(async groupId => {
            const ids = (await Promise.all(dates.map(async date => {
                const snapshot = await reference.child(groupId).child('changes').child(date.encoded).snapshot();
                if (!snapshot.exists)
                    return [];
                return Object.values(snapshot.value()); 
            }))).flatMap(ids => ids).filter((value, index, array) => array.indexOf(value) === index);
            const events = await Promise.all(ids.map(async id => {
                const snapshot = await reference.child(groupId).child(id).snapshot();
                if (!snapshot.exists)
                    return {
                        id: snapshot.key!,
                        state: 'deleted' as const
                    };
                return {
                    id: snapshot.key!,
                    ...snapshot.value('decrypt')
                };
            }));
            return {
                groupId: groupId,
                events: events
            };
        }));
    }
}

export type EventGetChangesFunctionType = FunctionType<{
    groupIds: EventGroupId[];
    upToDate: UtcDate;
}, {
    groupId: EventGroupId;
    events: (Event.Flatten | { id: string; state: 'deleted' })[];
}[], {
    groupIds: EventGroupId[];
    upToDate: string;
}>;
