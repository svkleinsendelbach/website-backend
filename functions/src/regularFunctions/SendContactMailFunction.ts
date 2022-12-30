import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

import { AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkPrerequirements } from '../utils/checkPrerequirements';
import { DatabaseType } from '../classes/DatabaseType';
import { FirebaseFunction } from '../utils/FirebaseFunction';
import { Logger } from '../utils/Logger';
import { ParameterContainer } from '../utils/Parameter/ParameterContainer';
import { ParameterParser } from '../utils/Parameter/ParameterParser';
import { sendContactMailAccount } from '../privateKeys';
import { FiatShamirParameters } from '../utils/fiatShamir';
import { ParameterBuilder } from '../utils/Parameter/ParameterBuilder';

export class SendContactMailFunction implements FirebaseFunction<
    SendContactMailFunction.Parameters,
    SendContactMailFunction.ReturnType
> {

    public parameters: SendContactMailFunction.Parameters;

    private logger: Logger;

    private transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: sendContactMailAccount,
        logger: true
    });

    public constructor(data: any, auth: AuthData | undefined) {
        this.logger = Logger.start(!!data.verbose, 'SendContactMailFunction.constructor', { data, auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, this.logger.nextIndent);
        const parameterParser = new ParameterParser<SendContactMailFunction.Parameters>(
            {
                fiatShamirParameters: ParameterBuilder.builder('object', FiatShamirParameters.fromObject),
                databaseType: ParameterBuilder.builder('string', DatabaseType.fromString),
                senderName: ParameterBuilder.trivialBuilder('string'),
                senderAddress: ParameterBuilder.trivialBuilder('string'),
                receiverName: ParameterBuilder.trivialBuilder('string'),
                receiverAddress: ParameterBuilder.trivialBuilder('string'),
                message: ParameterBuilder.trivialBuilder('string')
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<SendContactMailFunction.ReturnType> {
        this.logger.append('SendContactMailFunction.executeFunction', {}, 'info');
        await checkPrerequirements(this.parameters, this.logger.nextIndent, 'notRequired'); 
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

export namespace SendContactMailFunction {
    export type Parameters = FirebaseFunction.DefaultParameters & {
        senderName: string
        senderAddress: string
        receiverName: string
        receiverAddress: string
        message: string
    }

    export interface ReturnType {
        success: boolean
        message: string
    }
}
