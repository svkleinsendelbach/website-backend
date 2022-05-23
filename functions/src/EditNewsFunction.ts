import { AuthData, CallableContext } from 'firebase-functions/lib/common/providers/https';

import { Logger } from './Logger/Logger';
import { LogLevel } from './Logger/LogLevel';
import { ParameterContainer } from './ParameterContainer';
import { checkJWTForEditing, FirebaseFunction, httpsError, reference } from './utils';

export interface News {
  title: string;
  subtitle: string | null;
  date: string;
  shortDescription: string | null;
  newsUrl: string;
  disabled: boolean;
}

export class EditNewsFunction implements FirebaseFunction<void> {
  public constructor(
    private parameterContainer: ParameterContainer,
    private auth: AuthData | undefined,
    private logger: Logger,
  ) {}

  public static fromData(data: any, context: CallableContext) {
    const parameterContainer = new ParameterContainer(data);
    const logger = Logger.start(parameterContainer, 'EditNewsFunction.constructor', { data: data }, LogLevel.notice);
    return new EditNewsFunction(parameterContainer, context.auth, logger);
  }

  async executeFunction(): Promise<void> {
    this.logger.append('EditNewsFunction.executeFunction', undefined, LogLevel.info);

    const jsonWebToken = this.parameterContainer.parameter('jsonWebToken', 'string', this.logger.nextIndent);
    checkJWTForEditing(jsonWebToken, this.auth, this.logger.nextIndent);

    const editType = this.parameterContainer.parameter('editType', 'string', this.logger.nextIndent);
    const newsId = this.parameterContainer.parameter('newsId', 'string', this.logger.nextIndent);
    const newsRef = reference(`news/${newsId}`, this.parameterContainer, this.logger.nextIndent);

    if (editType !== 'add' && editType !== 'update')
      throw httpsError('invalid-argument', `Invalid edit type: ${editType}`, this.logger);

    const news: News = {
      title: this.parameterContainer.parameter('title', 'string', this.logger.nextIndent),
      subtitle: this.parameterContainer.optionalParameter('subtitle', 'string', this.logger.nextIndent) ?? null,
      date: this.parameterContainer.parameter('date', 'string', this.logger.nextIndent),
      shortDescription:
        this.parameterContainer.optionalParameter('shortDescription', 'string', this.logger.nextIndent) ?? null,
      newsUrl: this.parameterContainer.parameter('newsUrl', 'string', this.logger.nextIndent),
      disabled: this.parameterContainer.parameter('disabled', 'boolean', this.logger.nextIndent),
    };
    newsRef.update(news);
  }
}
