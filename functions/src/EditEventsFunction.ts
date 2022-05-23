import { AuthData, CallableContext } from 'firebase-functions/lib/common/providers/https';

import { Event } from './GetEventsFunction';
import { Logger } from './Logger/Logger';
import { LogLevel } from './Logger/LogLevel';
import { ParameterContainer } from './ParameterContainer';
import { checkJWTForEditing, FirebaseFunction, httpsError, reference } from './utils';

export class EditEventsFunction implements FirebaseFunction<void> {
  public constructor(
    private parameterContainer: ParameterContainer,
    private auth: AuthData | undefined,
    private logger: Logger,
  ) {}

  public static fromData(data: any, context: CallableContext) {
    const parameterContainer = new ParameterContainer(data);
    const logger = Logger.start(parameterContainer, 'EditEventsFunction.constructor', { data: data }, LogLevel.notice);
    return new EditEventsFunction(parameterContainer, context.auth, logger);
  }

  async executeFunction(): Promise<void> {
    this.logger.append('EditEventsFunction.executeFunction', undefined, LogLevel.info);

    const jsonWebToken = this.parameterContainer.parameter('jsonWebToken', 'string', this.logger.nextIndent);
    checkJWTForEditing(jsonWebToken, this.auth, this.logger.nextIndent);

    const editType = this.parameterContainer.parameter('editType', 'string', this.logger.nextIndent);
    const groupId = this.parameterContainer.parameter('groupId', 'string', this.logger.nextIndent);
    const eventId = this.parameterContainer.parameter('eventId', 'string', this.logger.nextIndent);
    const eventRef = reference(`events/${groupId}/${eventId}`, this.parameterContainer, this.logger.nextIndent);

    switch (editType) {
      case 'add':
      case 'update':
        const event: Omit<Event, 'id'> = {
          date: this.parameterContainer.parameter('eventDate', 'string', this.logger.nextIndent),
          title: this.parameterContainer.parameter('eventTitle', 'string', this.logger.nextIndent),
          subtitle:
            this.parameterContainer.optionalParameter('eventSubtitle', 'string', this.logger.nextIndent) ??
            (null as any),
          link:
            this.parameterContainer.optionalParameter('eventLink', 'string', this.logger.nextIndent) ?? (null as any),
        };
        eventRef.update(event);
        return;

      case 'remove':
        eventRef.remove();
        return;

      default:
        throw httpsError('invalid-argument', `Invalid edit type: ${editType}`, this.logger);
    }
  }
}
