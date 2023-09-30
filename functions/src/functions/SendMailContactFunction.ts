import { type DatabaseType, type IFirebaseFunction, type ILogger, ParameterParser, type IFunctionType, IDatabaseReference, IParameterContainer, ValueParameterBuilder } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';
import { sendContactMailAccount } from '../privateKeys';
import { Discord } from '../Discord';
import { EmbedBuilder } from 'discord.js';
import { DatabaseScheme } from '../DatabaseScheme';

export class SendMailContactFunction implements IFirebaseFunction<SendMailContactFunctionType> {
    public readonly parameters: IFunctionType.Parameters<SendMailContactFunctionType> & { databaseType: DatabaseType };

    private readonly transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: sendContactMailAccount,
        logger: true
    });

    public constructor(
        parameterContainer: IParameterContainer, 
        auth: AuthData | null, 
        databaseReference: IDatabaseReference<DatabaseScheme>, 
        private readonly logger: ILogger
    ) {
        this.logger.log('SendMailContactFunction.constructor', { auth: auth }, 'notice');
        const parameterParser = new ParameterParser<IFunctionType.Parameters<SendMailContactFunctionType>>(
            {
                senderName: new ValueParameterBuilder('string'),
                senderAddress: new ValueParameterBuilder('string'),
                receiverName: new ValueParameterBuilder('string'),
                receiverAddress: new ValueParameterBuilder('string'),
                message: new ValueParameterBuilder('string')
            },
            this.logger.nextIndent
        );
        parameterParser.parse(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async execute(): Promise<IFunctionType.ReturnType<SendMailContactFunctionType>> {
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
        void Discord.execute(this.parameters.databaseType, async discord => {
            await discord.add('contactRequest', {
                embeds: [new EmbedBuilder()
                    .setTitle(`${this.parameters.senderName} | ${this.parameters.senderAddress}`)
                    .setDescription(`An: ${this.parameters.receiverName}, ${this.parameters.receiverAddress}\n\n${this.parameters.message}`)]
            });
        });
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

export type SendMailContactFunctionType = IFunctionType<{
    senderName: string;
    senderAddress: string;
    receiverName: string;
    receiverAddress: string;
    message: string;
}, {
    success: boolean;
    message: string;
}>;
