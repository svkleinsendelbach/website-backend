import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

import { Logger } from './Logger/Logger';
import { LogLevel } from './Logger/LogLevel';
import { ParameterContainer } from './ParameterContainer';
import { FirebaseFunction } from './utils';

type ValidEventGroupId =
  | 'football-adults/general'
  | 'football-adults/first-team'
  | 'football-adults/second-team'
  | 'football-adults/ah-team'
  | 'football-youth/general'
  | 'football-youth/c-youth'
  | 'football-youth/e-youth'
  | 'football-youth/f-youth'
  | 'football-youth/g-youth';

interface Event {
  id: string;
  date: string;
  title: string;
  subtitle?: string;
  link?: string;
}

export class GetEventsFunction implements FirebaseFunction<{ groupId: ValidEventGroupId; events: Event[] }[]> {
  public constructor(private parameterContainer: ParameterContainer, private logger: Logger) {}

  public static fromData(data: any) {
    const parameterContainer = new ParameterContainer(data);
    const logger = Logger.start(parameterContainer, 'GetEventsFunction.constructor', { data: data }, LogLevel.notice);
    return new GetEventsFunction(parameterContainer, logger);
  }

  async executeFunction(): Promise<{ groupId: ValidEventGroupId; events: Event[] }[]> {
    this.logger.append('GetEventsFunction.executeFunction', undefined, LogLevel.info);
    const groupIds = this.parameterContainer.parameter('groupIds', 'object', this.logger.nextIndent);
    if (!Array.isArray(groupIds)) {
      throw new functions.https.HttpsError('invalid-argument', "Couldn't get group ids.");
    }
    return (await Promise.all(groupIds.map(this.getEvents))).compactMap(e => e);
  }

  async getEvents(groupId: ValidEventGroupId): Promise<{ groupId: ValidEventGroupId; events: Event[] } | undefined> {
    const reference = admin.database().ref(`events/${groupId}`);
    const snapshot = await reference.once('value');
    if (!snapshot.exists() || !snapshot.hasChildren()) {
      return undefined;
    }
    const events = Object.entries(snapshot.val()).compactMap(entry => {
      const date: Date = new Date((entry[1] as any).date);
      if (date < new Date()) {
        return undefined;
      }
      return {
        ...(entry[1] as any),
        id: entry[0],
      };
    });
    if (events.length == 0) {
      return undefined;
    }
    events.sort((a, b) => (new Date(a.date) < new Date(b.date) ? -1 : 1));
    return {
      groupId: groupId,
      events: events,
    };
  }
}
