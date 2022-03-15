import fetch from 'cross-fetch';
import * as functions from 'firebase-functions';

import { Logger } from './Logger/Logger';
import { LogLevel } from './Logger/LogLevel';
import { ParameterContainer } from './ParameterContainer';
import { recaptchaSecretKey } from './recaptchaSecretKey';
import { FirebaseFunction } from './utils';

interface VerifyResponse {
  success: boolean;
  // eslint-disable-next-line camelcase
  challenge_ts: string;
  hostname: string;
  errorCodes?: string[];
}

export class VerifyRecaptchaFunction implements FirebaseFunction<VerifyResponse> {
  public constructor(private parameterContainer: ParameterContainer, private logger: Logger) {}

  public static fromData(data: any): VerifyRecaptchaFunction {
    const parameterContainer = new ParameterContainer(data);
    const logger = Logger.start(
      parameterContainer,
      'VerifyRecaptchaFunction.constructor',
      { data: data },
      LogLevel.notice,
    );
    return new VerifyRecaptchaFunction(parameterContainer, logger);
  }

  async executeFunction(): Promise<VerifyResponse> {
    this.logger.append('VerifyRecaptchaFunction.executeFunction', undefined, LogLevel.info);
    const actionType = this.parameterContainer.parameter('actionType', 'string', this.logger.nextIndent);
    let secretKey: string;
    switch (actionType) {
      case 'contactForm':
        secretKey = recaptchaSecretKey.contactForm;
        break;
      default:
        throw new functions.https.HttpsError('invalid-argument', `Invalid action type: ${actionType}`);
    }
    const token = this.parameterContainer.parameter('token', 'string', this.logger.nextIndent);
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
    return await (await fetch(url)).json();
  }
}
