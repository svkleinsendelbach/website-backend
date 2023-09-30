import { type DatabaseType, type IFirebaseFunction, type ILogger, Guid, ParameterBuilder, ParameterParser, HttpsError, type IFunctionType, CryptedScheme, IParameterContainer, IDatabaseReference, GuardParameterBuilder, NullableParameterBuilder } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkUserRoles } from '../checkUserRoles';
import { DatabaseScheme } from '../DatabaseScheme';
import { EditType } from '../types/EditType';
import { Event, EventGroupId } from '../types/Event';
import { Discord } from '../Discord';

export class EventEditFunction implements IFirebaseFunction<EventEditFunctionType> {
    public readonly parameters: IFunctionType.Parameters<EventEditFunctionType> & { databaseType: DatabaseType };

    public constructor(
        parameterContainer: IParameterContainer, 
        private readonly auth: AuthData | null, 
        private readonly databaseReference: IDatabaseReference<DatabaseScheme>, 
        private readonly logger: ILogger
    ) {
        this.logger.log('EventEditFunction.constructor', { auth: auth }, 'notice');
        const parameterParser = new ParameterParser<IFunctionType.Parameters<EventEditFunctionType>>(
            {
                editType: new GuardParameterBuilder('string', EditType.typeGuard),
                groupId: new GuardParameterBuilder('string', EventGroupId.typeGuard),
                previousGroupId: new NullableParameterBuilder(new GuardParameterBuilder('string', EventGroupId.typeGuard)),
                eventId: new ParameterBuilder('string', Guid.fromString),
                event: new NullableParameterBuilder(new ParameterBuilder('object', Event.fromObject))
            },
            this.logger.nextIndent
        );
        parameterParser.parse(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async execute(): Promise<IFunctionType.ReturnType<EventEditFunctionType>> {
        this.logger.log('EventEditFunction.executeFunction', {}, 'info');
        await checkUserRoles(this.auth, 'websiteManager', this.databaseReference, this.logger);
        switch (this.parameters.editType) {
            case 'add':
                return await this.addEvent();
            case 'change':
                return await this.changeEvent();
            case 'remove':
                return await this.removeEvent();
        }
    }

    private get reference(): IDatabaseReference<CryptedScheme<Omit<Event.Flatten, 'id'>>> {
        return this.databaseReference.child('events').child(this.parameters.groupId).child(this.parameters.eventId.guidString);
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
        const event = this.parameters.event;
        const discordMessageId = await Discord.execute(this.parameters.databaseType, async discord => {
            return await discord.add('events', { embeds: [Event.discordEmbed(event, this.parameters.groupId)] });
        }, null);
        await this.reference.set(Event.flatten(Event.addDiscordMessageId(event, discordMessageId)), 'encrypt');
    }

    private async changeEvent() {
        if (!this.parameters.event)
            throw HttpsError('invalid-argument', 'No event in parameters to change.', this.logger);
        const databaseEvent = await this.removePreviousEvent();
        if (!databaseEvent)
            throw HttpsError('invalid-argument', 'Couldn\'t change not existing event.', this.logger);
        const event = Event.addDiscordMessageId(this.parameters.event, databaseEvent.discordMessageId);
        void Discord.execute(this.parameters.databaseType, async discord => {
            await discord.change('events', event.discordMessageId, { embeds: [Event.discordEmbed(event, this.parameters.groupId)] });
        });
        await this.reference.set(Event.flatten(event), 'encrypt');
    }

    private async removePreviousEvent(): Promise<Omit<Event, "id">> {
        if (!this.parameters.previousGroupId)
            throw HttpsError('invalid-argument', 'No previous group id in parameters to change.', this.logger);
        const previousReference = this.databaseReference.child('events').child(this.parameters.previousGroupId).child(this.parameters.eventId.guidString);
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
            await discord.remove('events', databaseEvent.discordMessageId);
        });
        await this.reference.remove();
    }
}

export type EventEditFunctionType = IFunctionType<{
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
