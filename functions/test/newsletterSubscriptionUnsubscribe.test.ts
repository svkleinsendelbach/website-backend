import { expect } from "firebase-function/lib/src/testUtils";
import { authenticateTestUser, cleanUpFirebase, firebaseApp } from "./firebaseApp";
import { sha512 } from "firebase-function";

describe('newsletterSubsribptionUnsubscribe', () => {
    beforeEach(async () => {
        await authenticateTestUser();
    });

    afterEach(async () => {
        await cleanUpFirebase();
    });

    it('unsubscribe no id and email', async () => {
        const result = await firebaseApp.functions.function('newsletter').function('subscription').function('unsubscribe').call({
            id: null, 
            email: null
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'Id and email are null.'
        });
    });

    it('unsubscribe with id and email', async () => {
        const id1 = sha512('test.user.1@web.de').slice(0, 16);
        const id2 = sha512('test.user.2@web.de').slice(0, 16);
        await firebaseApp.database.child('newsletter-subscriptions').child(id1).set('test.user.1@web.de', 'encrypt');
        await firebaseApp.database.child('newsletter-subscriptions').child(id2).set('test.user.2@web.de', 'encrypt');
        const result = await firebaseApp.functions.function('newsletter').function('subscription').function('unsubscribe').call({
            id: id1,
            email: 'test.user.2@web.de'
        });
        result.success;
        expect(await firebaseApp.database.child('newsletter-subscriptions').child(id1).exists()).to.be.equal(false);
        expect(await firebaseApp.database.child('newsletter-subscriptions').child(id2).get('decrypt')).to.be.equal('test.user.2@web.de');
    });

    it('unsubscribe with id', async () => {
        const id = sha512('test.user@web.de').slice(0, 16);
        await firebaseApp.database.child('newsletter-subscriptions').child(id).set('test.user@web.de', 'encrypt');
        const result = await firebaseApp.functions.function('newsletter').function('subscription').function('unsubscribe').call({
            id: id,
            email: null
        });
        result.success;
        expect(await firebaseApp.database.child('newsletter-subscriptions').child(id).exists()).to.be.equal(false);
    });

    it('unsubscribe with email', async () => {
        const id = sha512('test.user@web.de').slice(0, 16);
        await firebaseApp.database.child('newsletter-subscriptions').child(id).set('test.user@web.de', 'encrypt');
        const result = await firebaseApp.functions.function('newsletter').function('subscription').function('unsubscribe').call({
            id: null,
            email: 'test.user@web.de'
        });
        result.success;
        expect(await firebaseApp.database.child('newsletter-subscriptions').child(id).exists()).to.be.equal(false);
    });

    it('unsubscribe not existing with id', async () => {
        const result = await firebaseApp.functions.function('newsletter').function('subscription').function('unsubscribe').call({
            id: 'not-existing',
            email: null
        });
        result.failure.equal({
            code: 'not-found',
            message: 'Subscription could\'t be found.'
        });        
    });

    it('unsubscribe not existing with email', async () => {
        const result = await firebaseApp.functions.function('newsletter').function('subscription').function('unsubscribe').call({
            id: null,
            email: 'not-existing'
        });
        result.failure.equal({
            code: 'not-found',
            message: 'Subscription could\'t be found.'
        }); 
    });
});
