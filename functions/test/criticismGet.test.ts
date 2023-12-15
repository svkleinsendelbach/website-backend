import { Guid } from 'firebase-function';
import { authenticateTestUser, cleanUpFirebase, firebaseApp } from './firebaseApp';
import { Criticism } from '../src/types/Criticism';

describe('criticismGet', () => {
    beforeEach(async () => {
        await authenticateTestUser();
    });
    
    afterEach(async () => {
        await cleanUpFirebase();
    });

    async function addCriticism(number: number, workedOff: boolean): Promise<Criticism.Flatten> {
        const criticism: Omit<Criticism.Flatten, 'id'> = {
            type: Math.random() < 0.5 ? 'criticism' : 'suggestion',
            title: `title-${number}`,
            description: `description-${number}`,
            workedOff: workedOff
        };
        const criticismId = Guid.newGuid();
        await firebaseApp.database.child('criticisms').child(criticismId.guidString).set(criticism, 'encrypt');
        return {
            ...criticism,
            id: criticismId.guidString,
        };
    }

    it('get all criticisms', async () => {
        const criticism1 = await addCriticism(1, true);
        const criticism2 = await addCriticism(2, true);
        const criticism3 = await addCriticism(3, false,);
        const criticism4 = await addCriticism(4, true);
        const criticism5 = await addCriticism(5, false);
        const result1 = await firebaseApp.functions.function('criticism').function('get').call({
            workedOff: null
        });
        result1.success.unsorted([criticism1, criticism2, criticism3, criticism4, criticism5]);
        const result2 = await firebaseApp.functions.function('criticism').function('get').call({
            workedOff: false
        });
        result2.success.unsorted([criticism3, criticism5]);
        const result3 = await firebaseApp.functions.function('criticism').function('get').call({
            workedOff: true
        });
        result3.success.unsorted([criticism1, criticism2, criticism4]);
    });
});
