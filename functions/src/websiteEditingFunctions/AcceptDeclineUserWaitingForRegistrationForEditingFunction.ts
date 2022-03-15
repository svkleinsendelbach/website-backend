import { AuthData, CallableContext } from 'firebase-functions/lib/common/providers/https';

import { Logger } from '../Logger/Logger';
import { LogLevel } from '../Logger/LogLevel';
import { ParameterContainer } from '../ParameterContainer';
import { checkJWTForEditing, FirebaseFunction, httpsError, reference } from '../utils';

/**
 * Accepts / Declines a user waiting for registration for editing website. Signed in user calling this function
 * has to be authorized to edit the website.
 *
 * @params
 *  acceptDecline ('accept' | 'decline'): Whether user should be accepted or declined
 *  userId (string): Id of user to accept / decline for editing website, hashed with sha512
 *  jsonWebToken (string): Valid jwt of signed in user to check the right of accepting / declining users
 */
export class AcceptDeclineUserWaitingForRegistrationForEditingFunction implements FirebaseFunction<void> {
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
  public static fromData(
    data: any,
    context: CallableContext,
  ): AcceptDeclineUserWaitingForRegistrationForEditingFunction {
    const parameterContainer = new ParameterContainer(data);
    const logger = Logger.start(
      parameterContainer,
      'AcceptDeclineUserWaitingForRegistrationForEditingFunction.fromData',
      { data: data },
      LogLevel.notice,
    );
    return new AcceptDeclineUserWaitingForRegistrationForEditingFunction(parameterContainer, context.auth, logger);
  }

  /**
   * Executes this firebase function
   */
  async executeFunction(): Promise<void> {
    // Log this method call
    this.logger.append(
      'AcceptDeclineUserWaitingForRegistrationForEditingFunction.executeFunction',
      undefined,
      LogLevel.info,
    );

    // Get accept / decline option and validate it
    const acceptDecline = this.parameterContainer.parameter('acceptDecline', 'string', this.logger.nextIndent);
    if (acceptDecline !== 'accept' && acceptDecline !== 'decline') {
      throw httpsError('invalid-argument', `Accept-Decline unknown value: ${acceptDecline}`, this.logger);
    }

    // Get jwt of signed in user and check the right of accepting / declining users
    const jsonWebToken = this.parameterContainer.parameter('jsonWebToken', 'string', this.logger.nextIndent);
    checkJWTForEditing(jsonWebToken, this.auth, this.logger.nextIndent);

    // Get data from waiting website editors of specified user
    const userId = this.parameterContainer.parameter('userId', 'string', this.logger.nextIndent);
    const userWaitingRef = reference(
      `users/waitingWebsiteEditors/${userId}`,
      this.parameterContainer,
      this.logger.nextIndent,
    );
    const userWaitingSnapshot = await userWaitingRef.once('value');
    if (!userWaitingSnapshot.exists()) {
      throw httpsError('not-found', "User with specifed id doesn't wait for registration", this.logger);
    }
    const userWaitingData: { first: string; last: string } = userWaitingSnapshot.val();

    // Add user to website editors if option is 'accept'
    if (acceptDecline === 'accept') {
      const userRef = reference(`users/websiteEditors/${userId}`, this.parameterContainer, this.logger.nextIndent);
      userRef.update(userWaitingData);
    }

    // Remove user from waiting users
    userWaitingRef.remove();
  }
}
