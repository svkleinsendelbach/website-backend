import { AuthData, CallableContext } from 'firebase-functions/lib/common/providers/https';

import { Logger } from '../Logger/Logger';
import { LogLevel } from '../Logger/LogLevel';
import { ParameterContainer } from '../ParameterContainer';
import { checkJWTForEditing, FirebaseFunction, reference } from '../utils';

/**
 * Get all users waiting for website editing.
 *
 * @params
 *  jsonWebToken (string): Valid jwt of signed in user to get users waiting
 *
 * @returns
 *  List of all users waiting for website editing
 */
export class GetUsersToWaitingForRegistrationForEditingFunction
  implements FirebaseFunction<{ id: string; name: { first: string; last: string } }[]>
{
  /**
   * Initializes this firebase function with the parameter container, authentication of signed in user and a logger
   * @param parameterContainer Contains all parameters from the function call
   * @param auth Authentication of signed in user
   * @param logger Used to log all method calls for a firebase function execution
   */
  public constructor(
    private parameterContainer: ParameterContainer,
    private auth: AuthData | undefined,
    private logger: Logger,
  ) {}

  /**
   * Initializes this firebase function with data and context from function call
   * @param data Data from the function call
   * @param context Contains authentication of signed in user
   * @returns This firebase function
   */
  public static fromData(data: any, context: CallableContext): GetUsersToWaitingForRegistrationForEditingFunction {
    const parameterContainer = new ParameterContainer(data);
    const logger = Logger.start(
      parameterContainer,
      'GetUsersToWaitingForRegistrationForEditingFunction.fromData',
      { data: data },
      LogLevel.notice,
    );
    return new GetUsersToWaitingForRegistrationForEditingFunction(parameterContainer, context.auth, logger);
  }

  /**
   * Executes this firebase function
   */
  async executeFunction(): Promise<{ id: string; name: { first: string; last: string } }[]> {
    // Log this method call
    this.logger.append('GetUsersToWaitingForRegistrationForEditingFunction.executeFunction', undefined, LogLevel.info);

    // Get jwt of signed in user and check the right of accepting / declining users
    const jsonWebToken = this.parameterContainer.parameter('jsonWebToken', 'string', this.logger.nextIndent);
    checkJWTForEditing(jsonWebToken, this.auth, this.logger.nextIndent);

    // Get all users waiting for website editing
    const waitingRef = reference('users/waitingWebsiteEditors', this.parameterContainer, this.logger.nextIndent);
    const snapshot = await waitingRef.once('value');
    if (!snapshot.exists()) {
      return [];
    }
    const list: { id: string; name: { first: string; last: string } }[] = [];
    snapshot.forEach(snapshot => {
      if (snapshot.key === null || !snapshot.exists()) return;
      list.push({
        id: snapshot.key,
        name: snapshot.val(),
      });
    });
    return list;
  }
}
