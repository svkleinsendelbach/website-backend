import { News } from './EditNewsFunction';
import { Logger } from './Logger/Logger';
import { LogLevel } from './Logger/LogLevel';
import { ParameterContainer } from './ParameterContainer';
import { FirebaseFunction, reference } from './utils';

export class GetNewsFunction implements FirebaseFunction<({ id: string } & News)[]> {
  public constructor(private parameterContainer: ParameterContainer, private logger: Logger) {}

  public static fromData(data: any) {
    const parameterContainer = new ParameterContainer(data);
    const logger = Logger.start(parameterContainer, 'GetNewsFunction.constructor', { data: data }, LogLevel.notice);
    return new GetNewsFunction(parameterContainer, logger);
  }

  async executeFunction(): Promise<({ id: string } & News)[]> {
    this.logger.append('GetNewsFunction.executeFunction', undefined, LogLevel.info);
    const newsRef = reference('news', this.parameterContainer, this.logger.nextIndent);
    const snapshot = await newsRef.once('value');
    if (!snapshot.exists() || !snapshot.hasChildren()) return [];
    const news = Object.entries<News>(snapshot.val()).compactMap<{ id: string } & News>(entry => {
      return { ...entry[1], id: entry[0] };
    });
    news.sort((a, b) => (new Date(a.date) > new Date(b.date) ? -1 : 1));
    const numberNews = this.parameterContainer.optionalParameter('numberNews', 'number', this.logger.nextIndent);
    if (numberNews !== undefined) news.splice(numberNews);
    return news;
  }
}
