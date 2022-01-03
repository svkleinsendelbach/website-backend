import * as admin from 'firebase-admin';

import { DBPlayer } from './DBPlayer/DBPlayer';
import { Logger } from './Logger/Logger';
import { LogLevel } from './Logger/LogLevel';
import { ParameterContainer } from './ParameterContainer';
import { FirebaseFunction, throwsAsUndefined } from './utils';

export class GetAllDBPlayersFunction implements FirebaseFunction<DBPlayer[]> {
  constructor(private logger: Logger) {}

  public static fromData(data: any): GetAllDBPlayersFunction {
    const parameterContainer = new ParameterContainer(data);
    const logger = Logger.start(
      parameterContainer,
      'GetAllDBPlayersFunction.constructor',
      { data: data },
      LogLevel.notice,
    );
    return new GetAllDBPlayersFunction(logger);
  }

  /**
   * Executes this firebase function.
   */
  async executeFunction(): Promise<DBPlayer[]> {
    this.logger.append('GetAllDBPlayersFunction.executeFunction', undefined, LogLevel.info);

    const reference = admin.database().ref('players');
    const snapshot = await reference.once('value');
    if (!snapshot.exists() || !snapshot.hasChildren()) {
      return [];
    }
    return Object.entries(snapshot.val()).compactMap(entry => {
      return throwsAsUndefined(() => {
        return DBPlayer.fromValue(entry[1], entry[0]);
      });
    });
  }
}
