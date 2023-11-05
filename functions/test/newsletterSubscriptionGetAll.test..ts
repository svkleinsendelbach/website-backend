import { sha512 } from 'firebase-function';
import { cleanUpFirebase, firebaseApp } from './firebaseApp';

describe('newsletterSubscriptionGetAll', () => {
    afterEach(async () => {
        await cleanUpFirebase();
    });

    async function addSubscription(number: number): Promise<{ id: string; email: string }> {
        const email = `test.user.${number}@web.de`;
        const id = sha512(email).slice(0, 16);
        await firebaseApp.database.child('newsletter-subscriptions').child(id).set(email, 'encrypt');
        return { id: id, email: email };
    }

    it('get newsletter subscriptions', async () => {
        const subscription3 = await addSubscription(3);
        const subscription1 = await addSubscription(1);
        const subscription2 = await addSubscription(2);
        const result = await firebaseApp.functions.function('newsletter').function('subscription').function('getAll').call({});
        result.success.unsorted([subscription1, subscription2, subscription3]);
    });
});
