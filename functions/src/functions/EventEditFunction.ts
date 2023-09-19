import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, HttpsError, type FunctionType, DatabaseReference, CryptedScheme } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkUserRoles } from '../checkUserRoles';
import { Guid } from '../types/Guid';
import { DatabaseScheme } from '../DatabaseScheme';
import { getPrivateKeys } from '../privateKeys';
import { EditType } from '../types/EditType';
import { Event, EventGroupId } from '../types/Event';
import { Discord } from '../discord';

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
        switch (this.parameters.editType) {
            case 'add':
                return await this.addEvent();
            case 'change':
                return await this.changeEvent();
            case 'remove':
                return await this.removeEvent();
        }
    }

    private get reference(): DatabaseReference<CryptedScheme<Omit<Event.Flatten, 'id'>>> {
        return DatabaseScheme.reference(this.parameters.databaseType).child('events').child(this.parameters.groupId).child(this.parameters.eventId.guidString);
    }

    private async getDatabaseEvent(): Promise<Omit<Event, 'id'> | null> {
        const snapshot = await this.reference.snapshot();
        if (!snapshot.exists)
            return null;
        return Event.concrete(snapshot.value('decrypt'));
    }

    private async addEvent() {
        if (!this.parameters.event)
            throw HttpsError('invalid-argument', 'No event in parameters to add.', this.logger);
        const databaseEvent = await this.getDatabaseEvent();
        if (databaseEvent)
            throw HttpsError('invalid-argument', 'Couldn\'t add existing event.', this.logger);
        let event = Event.addDiscordMessageId(this.parameters.event, null);
        event = await Discord.execute(this.parameters.databaseType, async discord => {
            return await discord.addEvent(event, this.parameters.groupId);
        }, event);
        await this.reference.set(Event.flatten(event), 'encrypt');
    }

    private async changeEvent() {
        if (!this.parameters.event)
            throw HttpsError('invalid-argument', 'No event in parameters to change.', this.logger);
        const databaseEvent = await this.removePreviousEvent();
        if (!databaseEvent)
            throw HttpsError('invalid-argument', 'Couldn\'t change not existing event.', this.logger);
        const event = Event.addDiscordMessageId(this.parameters.event, databaseEvent.discordMessageId);
        void Discord.execute(this.parameters.databaseType, async discord => {
            await discord.changeEvent(event, this.parameters.groupId);
        });
        await this.reference.set(Event.flatten(event), 'encrypt');
    }

    private async removePreviousEvent(): Promise<Omit<Event, "id">> {
        if (!this.parameters.previousGroupId)
            throw HttpsError('invalid-argument', 'No previous group id in parameters to change.', this.logger);
        const previousReference = DatabaseScheme.reference(this.parameters.databaseType).child('events').child(this.parameters.previousGroupId).child(this.parameters.eventId.guidString);
        const previousSnapshot = await previousReference.snapshot();
        if (!previousSnapshot.exists)
            throw HttpsError('invalid-argument', 'Couldn\'t change not existing event.', this.logger);
        await previousReference.remove();
        return Event.concrete(previousSnapshot.value('decrypt'));
    }

    private async removeEvent() {
        const databaseEvent = await this.getDatabaseEvent();
        if (!databaseEvent)
            return;
        void Discord.execute(this.parameters.databaseType, async discord => {
            await discord.removeEvent(databaseEvent);
        });
        await this.reference.remove();
    }
}

export type EventEditFunctionType = FunctionType<{
    editType: EditType;
    groupId: EventGroupId;
    previousGroupId: EventGroupId | null;
    eventId: Guid;
    event: Omit<Event, 'id' | 'discordMessageId'> | null;
}, void, {
    editType: EditType;
    groupId: EventGroupId;
    previousGroupId: EventGroupId | null;
    eventId: string;
    event: Omit<Event.Flatten, 'id' | 'discordMessageId'> | null;
}>;
