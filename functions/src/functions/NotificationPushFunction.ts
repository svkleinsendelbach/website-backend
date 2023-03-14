import * as admin from 'firebase-admin';
import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, type FunctionType, Crypter, DatabaseReference } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { checkUserAuthentication } from '../checkUserAuthentication';
import { type DatabaseScheme } from '../DatabaseScheme';
import { getPrivateKeys } from '../privateKeys';
import { NotifactionPayload, NotificationType } from '../types/Notification';

export class NotificationPushFunction implements FirebaseFunction<NotificationPushFunctionType> {
    public readonly parameters: FunctionType.Parameters<NotificationPushFunctionType> & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, private readonly auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('NotificationPushFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getPrivateKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<FunctionType.Parameters<NotificationPushFunctionType>>(
            {
                notificationType: ParameterBuilder.guard('string', NotificationType.typeGuard),
                payload: ParameterBuilder.build('object', NotifactionPayload.fromObject)
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<NotificationPushFunctionType>> {
        this.logger.log('NotificationPushFunction.executeFunction', {}, 'info');
        await checkUserAuthentication(this.auth, 'notification', this.parameters.databaseType, this.logger);
        const reference = DatabaseReference.base<DatabaseScheme>(getPrivateKeys(this.parameters.databaseType)).child('notification').child(this.parameters.notificationType);
        const snapshot = await reference.snapshot();
        const tokens = snapshot.map(snapshot => snapshot.value());
        if (tokens.length === 0)
            return;
        const response = await admin.messaging().sendToDevice(tokens, { notification: this.parameters.payload });
        await Promise.all(tokens.map(async (token, index) => await this.cleanupToken(response.results[index], token)));
    }

    private async cleanupToken(result: admin.messaging.MessagingDeviceResult, token: string) {
        if (result.error === undefined)
            return;
        if (result.error.code !== 'messaging/invalid-registration-token' && result.error.code !== 'messaging/registration-token-not-registered')
            return;
        const key = Crypter.sha512(token);
        const reference = DatabaseReference.base<DatabaseScheme>(getPrivateKeys(this.parameters.databaseType)).child('notification').child(this.parameters.notificationType).child(key);
        await reference.remove();
    }
}

export type NotificationPushFunctionType = FunctionType<{
    notificationType: NotificationType;
    payload: NotifactionPayload;
}, void>;
