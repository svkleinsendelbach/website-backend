import { Guid } from 'firebase-function';
import { type Newsletter } from '../src/types/Newsletter';
import { UtcDate } from 'firebase-function';
import { cleanUpFirebase, firebaseApp } from './firebaseApp';

describe('newsletterGetAll', () => {
    afterEach(async () => {
        await cleanUpFirebase();
    });

    function generateNewsletter(number: number): Omit<Newsletter.Flatten, 'id'> {
        return {
            date: new UtcDate(2023, 11, 1 + number, 12, 0).encoded,
            alreadyPublished: false,
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

    async function addNewsletter(number: number): Promise<Newsletter.Flatten> {
        const newsletter = generateNewsletter(number);
        const newsletterId = Guid.newGuid();
        await firebaseApp.database.child('newsletter').child(newsletterId.guidString).set(newsletter, 'encrypt');
        return {
            id: newsletterId.guidString,
            ...newsletter
        };
    }

    it('get newsletter', async () => {
        const newsletter3 = await addNewsletter(3);
        const newsletter1 = await addNewsletter(1);
        const newsletter2 = await addNewsletter(2);
        const result = await firebaseApp.functions.function('newsletter').function('getAll').call({});
        result.success.equal([
            {
                id: newsletter3.id,
                alreadyPublished: false,
                date: newsletter3.date,
                ...newsletter3.titlePage
            },
            {
                id: newsletter2.id,
                alreadyPublished: false,
                date: newsletter2.date,
                ...newsletter2.titlePage
            },
            {
                id: newsletter1.id,
                alreadyPublished: false,
                date: newsletter1.date,
                ...newsletter1.titlePage
            }
        ]);
    });
});
