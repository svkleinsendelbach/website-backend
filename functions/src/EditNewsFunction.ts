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
  thumbnailUrl: string;
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
    let newsId = this.parameterContainer.optionalParameter('newsId', 'string', this.logger.nextIndent);
    const title = this.parameterContainer.parameter('title', 'string', this.logger.nextIndent);
    if (newsId === undefined) {
      newsId = await this.getNextId(title);
    }
    const newsRef = reference(`news/${newsId}`, this.parameterContainer, this.logger.nextIndent);

    if (editType !== 'add' && editType !== 'update')
      throw httpsError('invalid-argument', `Invalid edit type: ${editType}`, this.logger);

    const news: News = {
      title: title,
      subtitle: this.parameterContainer.optionalParameter('subtitle', 'string', this.logger.nextIndent) ?? null,
      date: this.parameterContainer.parameter('date', 'string', this.logger.nextIndent),
      shortDescription:
        this.parameterContainer.optionalParameter('shortDescription', 'string', this.logger.nextIndent) ?? null,
      newsUrl: this.parameterContainer.parameter('newsUrl', 'string', this.logger.nextIndent),
      disabled: this.parameterContainer.parameter('disabled', 'boolean', this.logger.nextIndent),
      thumbnailUrl: this.parameterContainer.parameter('thumbnailUrl', 'string', this.logger.nextIndent),
    };
    newsRef.update(news);
  }

  private async getNextId(id: string, alreadyChanged: boolean = false): Promise<string> {
    if (!alreadyChanged) {
      id = this.generateId(id);
    }
    const allNewsRef = reference('news', this.parameterContainer, this.logger.nextIndent);
    const allNewsSnapshot = await allNewsRef.once('value');
    const idChanged = allNewsSnapshot.forEach(newsSnapshot => {
      if (newsSnapshot.key === id) {
        const regex = /-(\d+)$/;
        const match = regex.exec(id);
        if (match !== null) {
          const nextValue = Number.parseInt(match[1]) + 1;
          id = id.replace(regex, `_${nextValue}`);
        } else {
          id += '-1';
        }
        return true;
      }
      return false;
    });
    if (idChanged) {
      id = await this.getNextId(id, true);
    }
    return id;
  }

  private generateId(title: string): string {
    const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-';
    const replacements = {
      ß: 'ss',
      Ä: 'Ae',
      Ö: 'Oe',
      Ü: 'Ue',
      ä: 'ae',
      ö: 'oe',
      ü: 'ue',
    };
    const toDash = ' _.,:;@~€#\'"+*!§$%&/()=?`¡“¶¢[]|{}≠¿';
    let id = '';
    for (const char of title) {
      if (validChars.includes(char)) {
        id += char.toLowerCase();
      } else if (replacements.hasOwnProperty(char)) {
        id += replacements[char as keyof typeof replacements].toLowerCase();
      } else if (toDash.includes(char)) {
        id += '-';
      }
    }
    while (/--/.test(id)) {
      id = id.replace(/--/g, '-');
    }
    return id;
  }
}
