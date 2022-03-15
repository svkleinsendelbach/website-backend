import { Logger } from '../Logger/Logger';
import { LogLevel } from '../Logger/LogLevel';
import { ParameterContainer } from '../ParameterContainer';
import { FirebaseFunction, reference } from '../utils';

/**
 * Get all users waiting for website editing.
 *
 * @returns
 *  List of all users waiting for website editing
 */
export class GetUsersToWaitingForRegistrationForEditingFunction
  implements FirebaseFunction<{ id: string; name: { first: string; last: string } }[]>
{
  /**
   * Initializes this firebase function with the parameter container and a logger
   * @param parameterContainer Contains all parameters from the function call
   * @param logger Used to log all method calls for a firebase function execution
   */
  public constructor(private parameterContainer: ParameterContainer, private logger: Logger) {}

  /**
   * Initializes this firebase function with data from function call
   * @param data Data from the function call
   * @returns This firebase function
   */
  public static fromData(data: any): GetUsersToWaitingForRegistrationForEditingFunction {
    const parameterContainer = new ParameterContainer(data);
    const logger = Logger.start(
      parameterContainer,
      'GetUsersToWaitingForRegistrationForEditingFunction.fromData',
      { data: data },
      LogLevel.notice,
    );
    return new GetUsersToWaitingForRegistrationForEditingFunction(parameterContainer, logger);
  }

  /**
   * Executes this firebase function
   */
  async executeFunction(): Promise<{ id: string; name: { first: string; last: string } }[]> {
    // Log this method call
    this.logger.append('GetUsersToWaitingForRegistrationForEditingFunction.executeFunction', undefined, LogLevel.info);

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
