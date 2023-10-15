import { type DatabaseType, type IFirebaseFunction, type ILogger, ParameterParser, type IFunctionType, IDatabaseReference, IParameterContainer, ValueParameterBuilder, GuardParameterBuilder, ParameterBuilder, HttpsError } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { DatabaseScheme } from '../DatabaseScheme';
import { Discord } from '../Discord';
import { EmbedBuilder } from 'discord.js';
import { discordKeys } from '../privateKeys';

function anwserFromObject(value: object | null, logger: ILogger): { email: string } | { phoneNumber: string } | { discordUserId: string } {
    logger.log('anwserFromObject', { value: value });

    if (value === null)
        throw HttpsError('internal', 'Couldn\'t get answer from null.', logger);

    if ('email' in value && typeof value.email === 'string')
        return { email: value.email };
    
    if ('phoneNumber' in value && typeof value.phoneNumber === 'string')
        return { phoneNumber: value.phoneNumber };
    
    if ('discordUserId' in value && typeof value.discordUserId === 'string')
        return { discordUserId: value.discordUserId };

    throw HttpsError('internal', 'Couldn\'t get answer.', logger);
}

export type Receiver = 'managers' | 'football-adults' | 'football-youth' | 'dancing' | 'gymnastics';

export namespace Receiver {
    export function typeGuard(value: string): value is Receiver {
        return ['managers', 'football-adults', 'football-youth', 'dancing', 'gymnastics'].includes(value);
    }
    
    export const description: Record<Receiver, string> = {
        'managers': 'Vorstandschaft',
        'football-adults': 'Herrenfußball',
        'football-youth': 'Jugendfußball',
        'dancing': 'Tanzen',
        'gymnastics': 'Gymnastik'
    };
}

export class ContactFunction implements IFirebaseFunction<ContactFunctionType> {
    public readonly parameters: IFunctionType.Parameters<ContactFunctionType> & { databaseType: DatabaseType };

    public constructor(
        parameterContainer: IParameterContainer, 
        auth: AuthData | null, 
        databaseReference: IDatabaseReference<DatabaseScheme>, 
        private readonly logger: ILogger
    ) {
        this.logger.log('ContactFunction.constructor', { auth: auth }, 'notice');
        const parameterParser = new ParameterParser<IFunctionType.Parameters<ContactFunctionType>>(
            {
                name: new ValueParameterBuilder('string'),
                answer: new ParameterBuilder('object', anwserFromObject),
                receiver: new GuardParameterBuilder('string', Receiver.typeGuard),
                message: new ValueParameterBuilder('string')
            },
            this.logger.nextIndent
        );
        parameterParser.parse(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async execute(): Promise<IFunctionType.ReturnType<ContactFunctionType>> {
        if ('email' in this.parameters.answer || 'phoneNumber' in this.parameters.answer) {            
            const answer = 'email' in this.parameters.answer ? `E-Mail: ${this.parameters.answer.email}` : `Telefonnummer: ${this.parameters.answer.phoneNumber}`;
            await Discord.execute(this.parameters.databaseType, async discord => {
                await discord.add(discordKeys.channelIds.contactRequest[this.parameters.receiver], {
                    embeds: [new EmbedBuilder()
                        .setTitle(`${this.parameters.name} | ${answer}`)
                        .setDescription(this.parameters.message)]
                });
            });
        } else {
            const discordUserId = this.parameters.answer.discordUserId;            
            await Discord.execute(this.parameters.databaseType, async discord => {
                await discord.discordContact(discordUserId, this.parameters.name, this.parameters.receiver, {
                    embeds: [new EmbedBuilder()
                        .setTitle(this.parameters.name)
                        .setDescription(this.parameters.message)]
                });
            });
        }
    }
}

export type ContactFunctionType = IFunctionType<{
    name: string;
    answer: { email: string } | { phoneNumber: string } | { discordUserId: string };
    receiver: Receiver;
    message: string;
}, void>;
