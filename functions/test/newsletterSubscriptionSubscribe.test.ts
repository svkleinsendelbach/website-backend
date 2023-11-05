import { expect } from "firebase-function/lib/src/testUtils";
import { authenticateTestUser, cleanUpFirebase, firebaseApp } from "./firebaseApp";
import { sha512 } from "firebase-function";

describe('newsletterSubsribptionSubscribe', () => {
    beforeEach(async () => {
        await authenticateTestUser();
    });

    afterEach(async () => {
        await cleanUpFirebase();
    });

    it('subscribe', async () => {
        const result = await firebaseApp.functions.function('newsletter').function('subscription').function('subscribe').call({
            email: 'test.user@web.de'
        });
        result.success;
        const id = sha512('test.user@web.de').slice(0, 16);
        expect(await firebaseApp.database.child('newsletter-subscriptions').child(id).get('decrypt')).to.be.equal('test.user@web.de');
    });

    it('subscribe existing', async () => {
        const id = sha512('test.user@web.de').slice(0, 16);
        await firebaseApp.database.child('newsletter-subscriptions').child(id).set('test.user@web.de', 'encrypt');
        const result = await firebaseApp.functions.function('newsletter').function('subscription').function('subscribe').call({
            email: 'test.user@web.de'
        });
        result.success;
        expect(await firebaseApp.database.child('newsletter-subscriptions').child(id).get('decrypt')).to.be.equal('test.user@web.de');
    });
});
