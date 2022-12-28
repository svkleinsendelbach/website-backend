import { News } from './EditNewsFunction';
import { Logger } from './Logger/Logger';
import { LogLevel } from './Logger/LogLevel';
import { ParameterContainer } from './ParameterContainer';
import { FirebaseFunction, reference } from './utils';

export class GetNewsFunction implements FirebaseFunction<{ news: ({ id: string } & News)[]; hasMore: boolean }> {
  public constructor(private parameterContainer: ParameterContainer, private logger: Logger) {}

  public static fromData(data: any) {
    const parameterContainer = new ParameterContainer(data);
    const logger = Logger.start(parameterContainer, 'GetNewsFunction.constructor', { data: data }, LogLevel.notice);
    return new GetNewsFunction(parameterContainer, logger);
  }

  async executeFunction(): Promise<{ news: ({ id: string } & News)[]; hasMore: boolean }> {
    this.logger.append('GetNewsFunction.executeFunction', undefined, LogLevel.info);
    const newsRef = reference('news', this.parameterContainer, this.logger.nextIndent);
    const snapshot = await newsRef.once('value');
    if (!snapshot.exists() || !snapshot.hasChildren()) return { news: [], hasMore: false };
    const allNews = Object.entries<News>(snapshot.val()).compactMap<{ id: string } & News>(entry => {
      return { ...entry[1], id: entry[0] };
    });
    allNews.sort((a, b) => (new Date(a.date) > new Date(b.date) ? -1 : 1));
    const numberNews = this.parameterContainer.optionalParameter('numberNews', 'number', this.logger.nextIndent);
    let newsCounter = 0;
    const newsToReturn: ({ id: string } & News)[] = [];
    if (numberNews !== undefined) {
      for (const news of allNews) {
        if (newsCounter == numberNews) {
          if (!news.disabled) {
            newsCounter += 1;
          }
          newsToReturn.push(news);
        } else {
          if (!news.disabled) {
            return { news: newsToReturn, hasMore: true };
          }
        }
      }
      return { news: newsToReturn, hasMore: false };
    }
    return { news: allNews, hasMore: false };
  }
}
