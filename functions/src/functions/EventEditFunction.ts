import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, DatabaseReference, HttpsError, type FunctionType } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkUserAuthentication } from '../checkUserAuthentication';
import { Guid } from '../types/Guid';
import { type DatabaseScheme } from '../DatabaseScheme';
import { getCryptionKeys, getDatabaseUrl } from '../privateKeys';
import { EditType } from '../types/EditType';
import { Event, EventGroupId } from '../types/Event';

export class EventEditFunction implements FirebaseFunction<EventEditFunctionType> {
    public readonly parameters: FunctionType.Parameters<EventEditFunctionType> & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, private readonly auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('EventEditFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getCryptionKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<FunctionType.Parameters<EventEditFunctionType>>(
            {
                editType: ParameterBuilder.guard('string', EditType.typeGuard),
                groupId: ParameterBuilder.guard('string', EventGroupId.typeGuard),
                eventId: ParameterBuilder.build('string', Guid.fromString),
                event: ParameterBuilder.optional(ParameterBuilder.build('object', Event.fromObject))
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<EventEditFunctionType>> {
        this.logger.log('EventEditFunction.executeFunction', {}, 'info');
        await checkUserAuthentication(this.auth, 'editEvents', this.parameters.databaseType, this.logger);
        const reference = DatabaseReference.base<DatabaseScheme>(getDatabaseUrl(this.parameters.databaseType), getCryptionKeys(this.parameters.databaseType)).child('events').child(this.parameters.groupId).child(this.parameters.eventId.guidString);
        const snapshot = await reference.snapshot();
        if (this.parameters.editType === 'remove') {
            if (snapshot.exists)
                await reference.remove();
        } else {
            if (this.parameters.event === undefined)
                throw HttpsError('invalid-argument', 'No event in parameters to add / change.', this.logger);
            if (this.parameters.editType === 'add' && snapshot.exists)
                throw HttpsError('invalid-argument', 'Couldn\'t add existing event.', this.logger);
            if (this.parameters.editType === 'change' && !snapshot.exists)
                throw HttpsError('invalid-argument', 'Couldn\'t change not existing event.', this.logger);
            await reference.set(Event.flatten(this.parameters.event), true);
        }
    }
}

export type EventEditFunctionType = FunctionType<{
    editType: EditType;
    groupId: EventGroupId;
    eventId: Guid;
    event: Omit<Event, 'id'> | undefined;
}, void, {
    editType: EditType;
    groupId: EventGroupId;
    eventId: string;
    event: Omit<Event.Flatten, 'id'> | undefined;
}>;
