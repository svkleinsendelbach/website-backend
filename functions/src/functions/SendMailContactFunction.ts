import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, type FunctionType } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';
import { getPrivateKeys, sendContactMailAccount } from '../privateKeys';

export class SendMailContactFunction implements FirebaseFunction<SendMailContactFunctionType> {
    public readonly parameters: FunctionType.Parameters<SendMailContactFunctionType> & { databaseType: DatabaseType };

    private readonly transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: sendContactMailAccount,
        logger: true
    });

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('SendMailContactFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getPrivateKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<FunctionType.Parameters<SendMailContactFunctionType>>(
            {
                senderName: ParameterBuilder.value('string'),
                senderAddress: ParameterBuilder.value('string'),
                receiverName: ParameterBuilder.value('string'),
                receiverAddress: ParameterBuilder.value('string'),
                message: ParameterBuilder.value('string')
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<SendMailContactFunctionType>> {
        this.logger.log('SendMailContactFunction.executeFunction', {}, 'info');
        const mailOptions: Mail.Options = {
            from: `${this.parameters.senderName} <${this.parameters.senderAddress}>`,
            to: 'steven.kellner@gmx.de', // this.parameters.receiverAddress,
            subject: `${this.parameters.senderName}: E-Mail von der SVK-Website`,
            text: `
                Hallo Vertreter der/des ${this.parameters.receiverName}/s,
                
                diese Mail wurde von der SV Kleinsendelbach Website von ${this.parameters.senderName}, ${this.parameters.senderAddress} versendet:
                
                ${this.parameters.message}
                `,
            html: `
                <p style="font-size: 16px;">Hallo Vertreter der/des ${this.parameters.receiverName}/s,</p>
                <br/>
                <p>diese Mail wurde von der SV Kleinsendelbach Website von ${this.parameters.senderName}, ${this.parameters.senderAddress} versendet:</p>
                <br/>
                <p>${this.parameters.message}</p>
                `
        };
        return await new Promise<{ success: boolean; message: string }>(resolve => {
            this.transporter.sendMail(mailOptions, (error, info) => {
                if (error !== null) {
                    return resolve({
                        success: false,
                        message: error.toString()
                    });
                }
                return resolve({
                    success: true,
                    message: info.response
                });
            });
        });
    }
}

export type SendMailContactFunctionType = FunctionType<{
    senderName: string;
    senderAddress: string;
    receiverName: string;
    receiverAddress: string;
    message: string;
}, {
    success: boolean;
    message: string;
}>;
