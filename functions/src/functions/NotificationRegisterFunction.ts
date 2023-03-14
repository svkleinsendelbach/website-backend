import { type DatabaseType, type FirebaseFunction, type ILogger, ParameterBuilder, ParameterContainer, ParameterParser, type FunctionType, Crypter, DatabaseReference, HttpsError } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { type DatabaseScheme } from '../DatabaseScheme';
import { getPrivateKeys } from '../privateKeys';
import { NotificationType } from '../types/Notification';

export class NotificationRegisterFunction implements FirebaseFunction<NotificationRegisterFunctionType> {
    public readonly parameters: FunctionType.Parameters<NotificationRegisterFunctionType> & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('NotificationRegisterFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getPrivateKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<FunctionType.Parameters<NotificationRegisterFunctionType>>(
            {
                notificationType: ParameterBuilder.guard('string', NotificationType.typeGuard),
                token: ParameterBuilder.value('string')
            },
            this.logger.nextIndent
        );
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<NotificationRegisterFunctionType>> {
        this.logger.log('NotificationRegisterFunction.executeFunction', {}, 'info');
        const key = Crypter.sha512(this.parameters.token);
        const reference = DatabaseReference.base<DatabaseScheme>(getPrivateKeys(this.parameters.databaseType)).child('notification').child(this.parameters.notificationType).child(key);
        const snapshot = await reference.snapshot();
        if (snapshot.exists)
            throw HttpsError('already-exists', 'Couldn\'t register token multiple times.', this.logger);
        await reference.set(this.parameters.token);
    }
}

export type NotificationRegisterFunctionType = FunctionType<{
    notificationType: NotificationType;
    token: string;
}, void>;
