import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

import { Logger } from './Logger/Logger';
import { LogLevel } from './Logger/LogLevel';
import { ParameterContainer } from './ParameterContainer';
import { sendContactMailAccount } from './sendContactMailAccount';
import { FirebaseFunction, httpsError } from './utils';

export class SendContactMailFunction implements FirebaseFunction<{ success: boolean; message: string }> {
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: sendContactMailAccount,
    logger: true,
  });

  public constructor(private parameterContainer: ParameterContainer, private logger: Logger) {}

  public static fromData(data: any): SendContactMailFunction {
    const parameterContainer = new ParameterContainer(data);
    const logger = Logger.start(
      parameterContainer,
      'SendContactMailFunction.constructor',
      { data: data },
      LogLevel.notice,
    );
    return new SendContactMailFunction(parameterContainer, logger);
  }

  async executeFunction(): Promise<{ success: boolean; message: string }> {
    this.logger.append('SendContactMailFunction.executeFunction', undefined, LogLevel.info);
    const sender = this.parameterContainer.parameter('sender', 'object', this.logger.nextIndent);
    const receiver = this.parameterContainer.parameter('receiver', 'object', this.logger.nextIndent);
    if (typeof sender.name !== 'string') {
      throw httpsError('invalid-argument', `Couldn't get sender name.`, this.logger);
    } else if (typeof sender.address !== 'string') {
      throw httpsError('invalid-argument', `Couldn't get sender address.`, this.logger);
    } else if (typeof receiver.name !== 'string') {
      throw httpsError('invalid-argument', `Couldn't get receiver name.`, this.logger);
    } else if (typeof receiver.address !== 'string') {
      throw httpsError('invalid-argument', `Couldn't get receiver address.`, this.logger);
    }
    const message = this.parameterContainer.parameter('message', 'string', this.logger.nextIndent);
    const mailOptions: Mail.Options = {
      from: `${sender.name} <${sender.address}>`,
      to: 'steven.kellner@gmx.de', // receiver.address,
      subject: `${sender.name}: E-Mail von der SVK-Website`,
      text: `
            Hallo Vertreter der/des ${receiver.name}/s,
            
            diese Mail wurde von der SV Kleinsendelbach Website von ${sender.name}, ${sender.address} versendet:
            
            ${message}
        `,
      html: `
            <p style="font-size: 16px;">Hallo Vertreter der/des ${receiver.name}/s,</p>
            <br/>
            <p>diese Mail wurde von der SV Kleinsendelbach Website von ${sender.name}, ${sender.address} versendet:</p>
            <br/>
            <p>${message}</p>
        `,
    };
    return await new Promise<{ success: boolean; message: string }>((resolve, _reject) => {
      this.transporter.sendMail(mailOptions, (error, info) => {
        if (error !== null) {
          return resolve({ success: false, message: error.toString() });
        }
        return resolve({ success: true, message: info.response });
      });
    });
  }
}
