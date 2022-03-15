import { Logger } from '../Logger/Logger';
import { LogLevel } from '../Logger/LogLevel';
import { ParameterContainer } from '../ParameterContainer';
import { FirebaseFunction, reference } from '../utils';

/**
 * Adds a user to waiting website editors.
 *
 * @params
 *  userId (string): Id of user to add to waiting, hashed with sha512
 *  firstName (string): First name of user to add
 *  lastName (string): Last name of user to add
 */
export class AddUserToWaitingForRegistrationForEditingFunction implements FirebaseFunction<void> {
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
  public static fromData(data: any): AddUserToWaitingForRegistrationForEditingFunction {
    const parameterContainer = new ParameterContainer(data);
    const logger = Logger.start(
      parameterContainer,
      'AddUserToWaitingForRegistrationForEditingFunction.fromData',
      { data: data },
      LogLevel.notice,
    );
    return new AddUserToWaitingForRegistrationForEditingFunction(parameterContainer, logger);
  }

  /**
   * Executes this firebase function
   */
  async executeFunction(): Promise<void> {
    // Log this method call
    this.logger.append('AddUserToWaitingForRegistrationForEditingFunction.executeFunction', undefined, LogLevel.info);

    // Get user id, first and last name from parametes
    const userId = this.parameterContainer.parameter('userId', 'string', this.logger.nextIndent);
    const firstName = this.parameterContainer.parameter('firstName', 'string', this.logger.nextIndent);
    const lastName = this.parameterContainer.parameter('lastName', 'string', this.logger.nextIndent);

    // Add user to waiting website editors
    const userWaitingRef = reference(
      `users/waitingWebsiteEditors/${userId}`,
      this.parameterContainer,
      this.logger.nextIndent,
    );
    await userWaitingRef.update({
      first: firstName,
      last: lastName,
    });
  }
}
