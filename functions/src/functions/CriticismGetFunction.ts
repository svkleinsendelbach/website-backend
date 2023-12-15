import { type DatabaseType, type IFirebaseFunction, type ILogger, ParameterParser, type IFunctionType, IParameterContainer, IDatabaseReference, NullableParameterBuilder, ValueParameterBuilder } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';
import { Criticism } from '../types/Criticism';
import { checkUserRoles } from '../checkUserRoles';
import { DatabaseScheme } from '../DatabaseScheme';

export class CriticismGetFunction implements IFirebaseFunction<CriticismGetFunctionType> {
    public readonly parameters: IFunctionType.Parameters<CriticismGetFunctionType> & { databaseType: DatabaseType };

    public constructor(
        parameterContainer: IParameterContainer, 
        private readonly auth: AuthData | null, 
        private readonly databaseReference: IDatabaseReference<DatabaseScheme>, 
        private readonly logger: ILogger
    ) {
        this.logger.log('CriticismGetFunction.constructor', { auth: auth }, 'notice');
        const parameterParser = new ParameterParser<IFunctionType.Parameters<CriticismGetFunctionType>>(
            {
                workedOff: new NullableParameterBuilder(new ValueParameterBuilder('boolean'))
            },
            this.logger.nextIndent
        );
        parameterParser.parse(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async execute(): Promise<IFunctionType.ReturnType<CriticismGetFunctionType>> {
        this.logger.log('CriticismGetFunction.executeFunction', {}, 'info');
        await checkUserRoles(this.auth, 'admin', this.databaseReference, this.logger.nextIndent);
        const references = this.databaseReference.child('criticisms');
        const snapshot = await references.snapshot();
        if (!snapshot.exists || !snapshot.hasChildren)
            return [];
        return snapshot.compactMap(snapshot => {
            if (snapshot.key === null)
                return null;
            const criticism = snapshot.value('decrypt');
            if (this.parameters.workedOff === !criticism.workedOff)
                return null;
            return {
                ...criticism,
                id: snapshot.key
            };
        });
    }
}

export type CriticismGetFunctionType = IFunctionType<{
    workedOff: boolean | null;
}, Array<Criticism.Flatten>>;
