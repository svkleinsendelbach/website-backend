import { News } from './EditNewsFunction';
import { Logger } from './Logger/Logger';
import { LogLevel } from './Logger/LogLevel';
import { ParameterContainer } from './ParameterContainer';
import { FirebaseFunction, reference } from './utils';

export class GetSingleNewsByIdFunction implements FirebaseFunction<({ id: string } & News) | undefined> {
  public constructor(private parameterContainer: ParameterContainer, private logger: Logger) {}

  public static fromData(data: any) {
    const parameterContainer = new ParameterContainer(data);
    const logger = Logger.start(
      parameterContainer,
      'GetSingleNewsByIdFunction.constructor',
      { data: data },
      LogLevel.notice,
    );
    return new GetSingleNewsByIdFunction(parameterContainer, logger);
  }

  async executeFunction(): Promise<({ id: string } & News) | undefined> {
    this.logger.append('GetSingleNewsByIdFunction.executeFunction', undefined, LogLevel.info);
    const newsId = this.parameterContainer.parameter('newsId', 'string', this.logger.nextIndent);
    const newsRef = reference(`news/${newsId}`, this.parameterContainer, this.logger.nextIndent);
    const snapshot = await newsRef.once('value');
    if (!snapshot.exists()) return undefined;
    const news: { id: string } & News = snapshot.val();
    if (news.disabled) return undefined;
    return news;
  }
}
