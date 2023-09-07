import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, DatabaseReference, HttpsError, type FunctionType } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkUserRoles } from '../checkUserRoles';
import { Guid } from '../types/Guid';
import { type DatabaseScheme } from '../DatabaseScheme';
import { getPrivateKeys } from '../privateKeys';
import { EditType } from '../types/EditType';
import { Event, EventGroupId } from '../types/Event';

export class EventEditFunction implements FirebaseFunction<EventEditFunctionType> {
    public readonly parameters: FunctionType.Parameters<EventEditFunctionType> & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, private readonly auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('EventEditFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getPrivateKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<FunctionType.Parameters<EventEditFunctionType>>(
            {
                editType: ParameterBuilder.guard('string', EditType.typeGuard),
                groupId: ParameterBuilder.guard('string', EventGroupId.typeGuard),
                previousGroupId: ParameterBuilder.nullable(ParameterBuilder.guard('string', EventGroupId.typeGuard)),
                eventId: ParameterBuilder.build('string', Guid.fromString),
                event: ParameterBuilder.nullable(ParameterBuilder.build('object', Event.fromObject))
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<EventEditFunctionType>> {
        this.logger.log('EventEditFunction.executeFunction', {}, 'info');
        await checkUserRoles(this.auth, 'websiteManager', this.parameters.databaseType, this.logger);
        const reference = DatabaseReference.base<DatabaseScheme>(getPrivateKeys(this.parameters.databaseType)).child('events').child(this.parameters.groupId).child(this.parameters.eventId.guidString);
        const snapshot = await reference.snapshot();
        if (this.parameters.editType === 'remove') {
            if (snapshot.exists)
                await reference.remove();
        } else {
            if (!this.parameters.event)
                throw HttpsError('invalid-argument', 'No event in parameters to add / change.', this.logger);
            if (this.parameters.editType === 'add' && snapshot.exists)
                throw HttpsError('invalid-argument', 'Couldn\'t add existing event.', this.logger);
            if (this.parameters.editType === 'change') {
                if (!this.parameters.previousGroupId)
                    throw HttpsError('invalid-argument', 'No previous group id in parameters to change.', this.logger);
                const previousReference = DatabaseReference.base<DatabaseScheme>(getPrivateKeys(this.parameters.databaseType)).child('events').child(this.parameters.previousGroupId).child(this.parameters.eventId.guidString);
                const previousSnapshot = await previousReference.snapshot();
                if (!previousSnapshot.exists)
                    throw HttpsError('invalid-argument', 'Couldn\'t change not existing event.', this.logger);
                await previousReference.remove();
            }
            await reference.set(Event.flatten(this.parameters.event), 'encrypt');
        }
    }
}

export type EventEditFunctionType = FunctionType<{
    editType: EditType;
    groupId: EventGroupId;
    previousGroupId: EventGroupId | null;
    eventId: Guid;
    event: Omit<Event, 'id'> | null;
}, void, {
    editType: EditType;
    groupId: EventGroupId;
    previousGroupId: EventGroupId | null;
    eventId: string;
    event: Omit<Event.Flatten, 'id'> | null;
}>;
