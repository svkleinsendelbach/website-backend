import { Guid } from 'firebase-function';
import { authenticateTestUser, cleanUpFirebase, firebaseApp } from './firebaseApp';
import { CriticismSuggestion } from '../src/types/CriticismSuggestion';

describe('criticismSuggestionGetAll', () => {
    beforeEach(async () => {
        await authenticateTestUser();
    });
    
    afterEach(async () => {
        await cleanUpFirebase();
    });

    async function addCriticismSuggestion(number: number, workedOff: boolean): Promise<CriticismSuggestion.Flatten> {
        const criticismSuggestion: Omit<CriticismSuggestion.Flatten, 'id'> = {
            type: Math.random() < 0.5 ? 'criticism' : 'suggestion',
            title: `title-${number}`,
            description: `description-${number}`,
            workedOff: workedOff
        };
        const criticismSuggestionId = Guid.newGuid();
        await firebaseApp.database.child('criticismSuggestions').child(criticismSuggestionId.guidString).set(criticismSuggestion, 'encrypt');
        return {
            ...criticismSuggestion,
            id: criticismSuggestionId.guidString,
        };
    }

    it('get all criticismSuggestions', async () => {
        const criticismSuggestion1 = await addCriticismSuggestion(1, true);
        const criticismSuggestion2 = await addCriticismSuggestion(2, true);
        const criticismSuggestion3 = await addCriticismSuggestion(3, false,);
        const criticismSuggestion4 = await addCriticismSuggestion(4, true);
        const criticismSuggestion5 = await addCriticismSuggestion(5, false);
        const result1 = await firebaseApp.functions.function('criticismSuggestion').function('getAll').call({
            workedOff: null
        });
        result1.success.unsorted([criticismSuggestion1, criticismSuggestion2, criticismSuggestion3, criticismSuggestion4, criticismSuggestion5]);
        const result2 = await firebaseApp.functions.function('criticismSuggestion').function('getAll').call({
            workedOff: false
        });
        result2.success.unsorted([criticismSuggestion3, criticismSuggestion5]);
        const result3 = await firebaseApp.functions.function('criticismSuggestion').function('getAll').call({
            workedOff: true
        });
        result3.success.unsorted([criticismSuggestion1, criticismSuggestion2, criticismSuggestion4]);
    });
});
