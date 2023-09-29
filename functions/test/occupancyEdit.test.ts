import { expect } from 'firebase-function/lib/src/testUtils';
import { Guid } from 'firebase-function';
import { authenticateTestUser, cleanUpFirebase, firebaseApp } from './firebaseApp';
import { UtcDate } from 'firebase-function';

describe('occupancyEdit', () => {
    beforeEach(async () => {
        await authenticateTestUser();
    });

    afterEach(async () => {
        await cleanUpFirebase();
    });

    it('remove occupancy not existing', async () => {
        const occupancyId = Guid.newGuid();
        const result = await firebaseApp.functions.function('occupancy').function('edit').call({
            editType: 'remove',
            occupancyId: occupancyId.guidString,
            occupancy: null
        });
        result.success;
    });

    it('remove occupancy existing', async () => {
        const occupancyId = Guid.newGuid();
        await firebaseApp.database.child('occupancies').child(occupancyId.guidString).set({
            location: 'sportshome',
            title: 'title',
            start: UtcDate.now.encoded,
            end: UtcDate.now.advanced({ minute: 30 }).encoded,
            recurring: null,
            discordMessageId: null
        }, 'encrypt');
        const result = await firebaseApp.functions.function('occupancy').function('edit').call({
            editType: 'remove',
            occupancyId: occupancyId.guidString,
            occupancy: null
        });
        result.success;
        expect(await firebaseApp.database.child('occupancies').child(occupancyId.guidString).exists()).to.be.equal(false);
    });

    it('add occupancy not given over', async () => {
        const result = await firebaseApp.functions.function('occupancy').function('edit').call({
            editType: 'add',
            occupancyId: Guid.newGuid().guidString,
            occupancy: null
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'No occupancy in parameters to add.'
        });
    });

    it('add occupancy not existing', async () => {
        const occupancyId = Guid.newGuid();
        const date = UtcDate.now;
        const result = await firebaseApp.functions.function('occupancy').function('edit').call({
            editType: 'add',
            occupancyId: occupancyId.guidString,
            occupancy: {
                location: 'sportshome',
                title: 'title',
                start: date.encoded,
                end: date.advanced({ minute: 30 }).encoded,
                recurring: {
                    untilIncluding: date.advanced({ minute: 60 }).encoded,
                    repeatEvery: 'year',
                    excludingDates: [date.advanced({ minute: 45 }).encoded]
                }
            }
        });
        result.success;
        expect(await firebaseApp.database.child('occupancies').child(occupancyId.guidString).get('decrypt')).to.be.deep.equal({
            location: 'sportshome',
            title: 'title',
            start: date.encoded,
            end: date.advanced({ minute: 30 }).encoded,
            recurring: {
                untilIncluding: date.advanced({ minute: 60 }).encoded,
                repeatEvery: 'year',
                excludingDates: [date.advanced({ minute: 45 }).encoded]
            },
            discordMessageId: null
        });
    });

    it('add occupancy existing', async () => {
        const occupancyId = Guid.newGuid();
        const date1 = UtcDate.now;
        await firebaseApp.database.child('occupancies').child(occupancyId.guidString).set({
            location: 'sportshome',
            title: 'title-1',
            start: date1.encoded,
            end: date1.advanced({ minute: 30 }).encoded,
            recurring: {
                untilIncluding: date1.advanced({ minute: 60 }).encoded,
                repeatEvery: 'year',
                excludingDates: [date1.advanced({ minute: 45 }).encoded]
            },
            discordMessageId: null
        }, 'encrypt');
        const date2 = date1.advanced({ minute: 60 });
        const result = await firebaseApp.functions.function('occupancy').function('edit').call({
            editType: 'add',
            occupancyId: occupancyId.guidString,
            occupancy: {
                location: 'sportshome',
                title: 'title-2',
                start: date2.encoded,
                end: date2.advanced({ minute: 30 }).encoded,
                recurring: {
                    untilIncluding: date2.advanced({ minute: 60 }).encoded,
                    repeatEvery: 'year',
                    excludingDates: [date2.advanced({ minute: 45 }).encoded]
                }
            }
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'Couldn\'t add existing occupancy.'
        });
    });

    it('change occupancy not given over', async () => {
        const result = await firebaseApp.functions.function('occupancy').function('edit').call({
            editType: 'change',
            occupancyId: Guid.newGuid().guidString,
            occupancy: null
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'No occupancy in parameters to change.'
        });
    });

    it('change occupancy not existing', async () => {
        const occupancyId = Guid.newGuid();
        const date = UtcDate.now;
        const result = await firebaseApp.functions.function('occupancy').function('edit').call({
            editType: 'change',
            occupancyId: occupancyId.guidString,
            occupancy: {
                location: 'sportshome',
                title: 'title',
                start: date.encoded,
                end: date.advanced({ minute: 30 }).encoded,
                recurring: {
                    untilIncluding: date.advanced({ minute: 60 }).encoded,
                    repeatEvery: 'year',
                    excludingDates: [date.advanced({ minute: 45 }).encoded]
                }
            }
        });
        result.failure.equal({
            code: 'invalid-argument',
            message: 'Couldn\'t change not existing occupancy.'
        });
    });

    it('change occupancy existing', async () => {
        const occupancyId = Guid.newGuid();
        const date1 = UtcDate.now;
        await firebaseApp.database.child('occupancies').child(occupancyId.guidString).set({
            location: 'sportshome',
            title: 'title-1',
            start: date1.encoded,
            end: date1.advanced({ minute: 30 }).encoded,
            recurring: null,
            discordMessageId: null
        }, 'encrypt');
        const date2 = date1.advanced({ minute: 60 });
        const result = await firebaseApp.functions.function('occupancy').function('edit').call({
            editType: 'change',
            occupancyId: occupancyId.guidString,
            occupancy: {
                location: 'sportshome',
                title: 'title-2',
                start: date2.encoded,
                end: date2.advanced({ minute: 30 }).encoded,
                recurring: {
                    untilIncluding: date2.advanced({ minute: 60 }).encoded,
                    repeatEvery: 'year',
                    excludingDates: [date2.advanced({ minute: 45 }).encoded]
                }
            }
        });
        result.success;
        expect(await firebaseApp.database.child('occupancies').child(occupancyId.guidString).get('decrypt')).to.be.deep.equal({
            location: 'sportshome',
            title: 'title-2',
            start: date2.encoded,
            end: date2.advanced({ minute: 30 }).encoded,
            recurring: {
                untilIncluding: date2.advanced({ minute: 60 }).encoded,
                repeatEvery: 'year',
                excludingDates: [date2.advanced({ minute: 45 }).encoded]
            },
            discordMessageId: null
        });
    });
});
