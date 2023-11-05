import { expect } from 'firebase-function/lib/src/testUtils';
import { Guid } from 'firebase-function';
import { authenticateTestUser, cleanUpFirebase, firebaseApp } from './firebaseApp';
import { UtcDate } from 'firebase-function';
import { Newsletter } from '../src/types/Newsletter';

describe('newsletterEdit', () => {
    beforeEach(async () => {
        await authenticateTestUser();
    });

    afterEach(async () => {
        await cleanUpFirebase();
    });

    function generateNewsletter(number: number = 0): Omit<Newsletter.Flatten, 'id'> {
        return {
            date: new UtcDate(2023, 11, 1, 12, 0).encoded,
            discordMessageId: null,
            titlePage: {
                title: 'title',
                description: 'description',
                month: 'january',
                year: 2023
            },
            departments: {
                'football-adults/general': [
                    {
                        title: `title-${number}-1`,
                        description: `description-${number}-1`
                    },
                    {
                        title: `title-${number}-2`,
                        description: `description-${number}-2`
                    },
                    {
                        title: `title-${number}-3`,
                        description: `description-${number}-3`
                    }
                ],
                'football-adults/first-team': null,
                'football-adults/second-team': null,
                'football-youth/big-field': [
                    {
                        title: `title-${number}-4`,
                        description: `description-${number}-4`
                    }
                ],
                'football-youth/small-field': null, 
                'gymnastics': null,
                'dancing': null
            },
            events: {
                'general': null,
                'football-adults/general': [                    
                    {
                        date: new UtcDate(2023, 12, 1, 12, 0).encoded,
                        title: `title-${number}-1`,
                        subtitle: `subtitle-${number}-1`
                    },                    
                    {
                        date: new UtcDate(2023, 12, 2, 12, 0).encoded,
                        title: `title-${number}-2`,
                        subtitle: `subtitle-${number}-2`
                    }
                ],
                'football-adults/first-team': null,
                'football-adults/second-team': null,
                'football-adults/ah-team': null,
                'football-youth/general': [                    
                    {
                        date: new UtcDate(2023, 12, 3, 12, 0).encoded,
                        title: `title-${number}-3`,
                        subtitle: `subtitle-${number}-3`
                    }
                ],
                'football-youth/c-youth': null,
                'football-youth/e-youth': null,
                'football-youth/f-youth': null,
                'football-youth/g-youth': null,
                'gymnastics': null,
                'dancing': null
            }
        };
    }

    it('remove newsletter not existing', async () => {
        const newsletterId = Guid.newGuid();
        const result = await firebaseApp.functions.function('newsletter').function('edit').call({
            editType: 'remove',
            newsletterId: newsletterId.guidString,
            newsletter: null
        });
        result.success;
    });

    it('remove newsletter existing', async () => {
        const newsletterId = Guid.newGuid();
        await firebaseApp.database.child('newsletter').child(newsletterId.guidString).set(generateNewsletter(), 'encrypt');
        const result = await firebaseApp.functions.function('newsletter').function('edit').call({
            editType: 'remove',
            newsletterId: newsletterId.guidString,
            newsletter: null
        });
        result.success;
        expect(await firebaseApp.database.child('newsletter').child(newsletterId.guidString).exists()).to.be.equal(false);
    });

    it('add newsletter not given over', async () => {
        const result = await firebaseApp.functions.function('newsletter').function('edit').call({
            editType: 'add',
            newsletterId: Guid.newGuid().guidString,
            newsletter: null
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'No newsletter in parameters to add.'
        });
    });

    it('add newsletter not existing', async () => {
        const newsletterId = Guid.newGuid();
        const newsletter = generateNewsletter();
        const result = await firebaseApp.functions.function('newsletter').function('edit').call({
            editType: 'add',
            newsletterId: newsletterId.guidString,
            newsletter: newsletter
        });
        result.success;
        expect(await firebaseApp.database.child('newsletter').child(newsletterId.guidString).get('decrypt')).to.be.deep.equal(newsletter);
    });

    it('add newsletter existing', async () => {
        const newsletterId = Guid.newGuid();
        const newsletter1 = generateNewsletter(1);
        const newsletter2 = generateNewsletter(2);
        await firebaseApp.database.child('newsletter').child(newsletterId.guidString).set(newsletter1, 'encrypt');
        const result = await firebaseApp.functions.function('newsletter').function('edit').call({
            editType: 'add',
            newsletterId: newsletterId.guidString,
            newsletter: newsletter2
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'Couldn\'t add existing newsletter.'
        });
    });

    it('change newsletter not given over', async () => {
        const result = await firebaseApp.functions.function('newsletter').function('edit').call({
            editType: 'change',
            newsletterId: Guid.newGuid().guidString,
            newsletter: null
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'No newsletter in parameters to change.'
        });
    });

    it('change newsletter not existing', async () => {
        const newsletterId = Guid.newGuid();
        const newsletter = generateNewsletter();
        const result = await firebaseApp.functions.function('newsletter').function('edit').call({
            editType: 'change',
            newsletterId: newsletterId.guidString,
            newsletter: newsletter
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'Couldn\'t change not existing newsletter.'
        });
    });

    it('change newsletter existing', async () => {
        const newsletterId = Guid.newGuid();
        const newsletter1 = generateNewsletter(1);
        const newsletter2 = generateNewsletter(2);
        await firebaseApp.database.child('newsletter').child(newsletterId.guidString).set(newsletter1, 'encrypt');
        const result = await firebaseApp.functions.function('newsletter').function('edit').call({
            editType: 'change',
            newsletterId: newsletterId.guidString,
            newsletter: newsletter2
        });
        result.success;
        expect(await firebaseApp.database.child('newsletter').child(newsletterId.guidString).get('decrypt')).to.be.deep.equal(newsletter2);
    });
});
