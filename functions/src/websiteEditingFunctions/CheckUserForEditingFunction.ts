import * as jwt from 'jsonwebtoken';

import { Logger } from '../Logger/Logger';
import { LogLevel } from '../Logger/LogLevel';
import { ParameterContainer } from '../ParameterContainer';
import { FirebaseFunction, httpsError, reference } from '../utils';
import { jwtPrivateRsaKey } from './jwt_rsa_keys';

/**
 * Checks if specified user is authorized for editing website. Returns jwt and expires date if athorized,
 * throws a 'permission-denied' error otherwise.
 *
 * @params
 *  userId (string): Id of user to check if athorized to edit website, hashed with sha512
 *
 * @returns
 *  token (string): jwt with user id and expires at date.
 *  expiresAt (number): Date where token expires
 *
 * @throws
 *  permission-denied: If specified user isn't athorized to edit website
 */
export class CheckUserForEditingFunction implements FirebaseFunction<{ token: string; expiresAt: number }> {
  /**
   * Initializes this firebase function with the parameter containes and a logger
   * @param parameterContainer Contains all parameters from the function call
   * @param logger Used to log all method calls for a firebase function execution
   */
  public constructor(private parameterContainer: ParameterContainer, private logger: Logger) {}

  /**
   * Initializes this firebase function with data from function call
   * @param data Data from the function call
   * @returns This firebase function
   */
  public static fromData(data: any): CheckUserForEditingFunction {
    const parameterContainer = new ParameterContainer(data);
    const logger = Logger.start(
      parameterContainer,
      'CheckUserForEditingFunction.fromData',
      { data: data },
      LogLevel.notice,
    );
    return new CheckUserForEditingFunction(parameterContainer, logger);
  }

  /**
   * Executes this firebase function
   */
  async executeFunction(): Promise<{ token: string; expiresAt: number }> {
    // Log this method call
    this.logger.append('CheckUserForEditingFunction.executeFunction', undefined, LogLevel.info);

    // Check if user is authorized to edit website
    const userId = this.parameterContainer.parameter('userId', 'string', this.logger.nextIndent);
    const userRef = reference(`users/websiteEditors/${userId}`, this.parameterContainer, this.logger.nextIndent);
    const snapshot = await userRef.once('value');
    if (!snapshot.exists()) {
      throw httpsError('permission-denied', "User isn't authorized to edit website.", this.logger);
    }

    // Sign jwt
    const expiresAt = new Date().setHours(new Date().getHours() + 2);
    const token = jwt.sign(
      {
        userId,
        expiresAt: expiresAt,
      },
      jwtPrivateRsaKey,
      {
        algorithm: 'RS256',
      },
    );

    return { token, expiresAt };
  }
}
