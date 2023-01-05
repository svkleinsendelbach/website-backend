import { expect } from 'chai';
import { DatabaseType } from '../src/classes/DatabaseType';
import { EditType } from '../src/classes/EditType';
import { Logger } from '../src/utils/Logger';
import { expectHttpsError } from './utils';
import { Event, EventGroupId } from '../src/classes/Event';
import { guid } from '../src/classes/guid';
import { News } from '../src/classes/News';
import { databaseUrl } from '../src/privateKeys';
import { FiatShamirParameters } from '../src/classes/FiatShamirParameters';

describe('classes builder', () => {
    const logger = Logger.start(true, 'classes builder');
    
    describe('database type builder', () => {
        it('invalid value', () => {
            expectHttpsError(() => {
                DatabaseType.fromString('invalid', logger.nextIndent);
            }, 'internal');
        });

        it('release', () => {
            const databaseType = DatabaseType.fromString('release', logger.nextIndent);
            expect(databaseType.value).to.be.equal('release');
        });

        it('debug', () => {
            const databaseType = DatabaseType.fromString('debug', logger.nextIndent);
            expect(databaseType.value).to.be.equal('debug');
        });

        it('testing', () => {
            const databaseType = DatabaseType.fromString('testing', logger.nextIndent);
            expect(databaseType.value).to.be.equal('testing');
        });

        it('get database url', () => {
            expect(new DatabaseType('release').databaseUrl).to.be.equal(databaseUrl(new DatabaseType('release')));
            expect(new DatabaseType('debug').databaseUrl).to.be.equal(databaseUrl(new DatabaseType('debug')));
            expect(new DatabaseType('testing').databaseUrl).to.be.equal(databaseUrl(new DatabaseType('testing')));
        });
    });

    describe('edit type builder', () => {
        it('invalid value', () => {
            expectHttpsError(() => {
                EditType.fromString('invalid', logger.nextIndent);
            }, 'internal');
        });

        it('add', () => {
            const editType = EditType.fromString('add', logger.nextIndent);
            expect(editType.value).to.be.equal('add');
        });

        it('change', () => {
            const editType = EditType.fromString('change', logger.nextIndent);
            expect(editType.value).to.be.equal('change');
        });

        it('remove', () => {
            const editType = EditType.fromString('remove', logger.nextIndent);
            expect(editType.value).to.be.equal('remove');
        });
    });

    describe('event builder', () => {
        it('all properties', () => {
            const event = Event.fromObject({
                date: '2023-01-01T10:54:46.762Z',
                title: 'asdf',
                subtitle: 'qwer',
                link: 'yxcv'
            }, logger.nextIndent);
            expect(event).to.be.deep.equal({
                date: new Date('2023-01-01T10:54:46.762Z'),
                title: 'asdf',
                subtitle: 'qwer',
                link: 'yxcv'
            });
        });

        it('invalid date type', () => {
            expectHttpsError(() => {
                Event.fromObject({
                    date: 12,
                    title: 'asdf',
                    subtitle: 'qwer',
                    link: 'yxcv'
                }, logger.nextIndent);
            }, 'internal');
        });

        it('no date', () => {
            expectHttpsError(() => {
                Event.fromObject({
                    title: 'asdf',
                    subtitle: 'qwer',
                    link: 'yxcv'
                }, logger.nextIndent);
            }, 'internal');
        });

        it('invalid title type', () => {
            expectHttpsError(() => {
                Event.fromObject({
                    date: '2023-01-01T10:54:46.762Z',
                    title: 12,
                    subtitle: 'qwer',
                    link: 'yxcv'
                }, logger.nextIndent);
            }, 'internal');
        });

        it('no title', () => {
            expectHttpsError(() => {
                Event.fromObject({
                    date: '2023-01-01T10:54:46.762Z',
                    subtitle: 'qwer',
                    link: 'yxcv'
                }, logger.nextIndent);
            }, 'internal');
        });

        it('invalid subtitle type', () => {
            expectHttpsError(() => {
                Event.fromObject({
                    date: '2023-01-01T10:54:46.762Z',
                    title: 'asdf',
                    subtitle: 12,
                    link: 'yxcv'
                }, logger.nextIndent);
            }, 'internal');
        });

        it('no subtitle', () => {
            const event = Event.fromObject({
                date: '2023-01-01T10:54:46.762Z',
                title: 'asdf',
                link: 'yxcv'
            }, logger.nextIndent);
            expect(event).to.be.deep.equal({
                date: new Date('2023-01-01T10:54:46.762Z'),
                title: 'asdf',
                subtitle: undefined,
                link: 'yxcv'
            });
        });

        it('undefined subtitle', () => {
            const event = Event.fromObject({
                date: '2023-01-01T10:54:46.762Z',
                title: 'asdf',
                subtitle: undefined,
                link: 'yxcv'
            }, logger.nextIndent);
            expect(event).to.be.deep.equal({
                date: new Date('2023-01-01T10:54:46.762Z'),
                title: 'asdf',
                subtitle: undefined,
                link: 'yxcv'
            });
        });

        it('invalid link type', () => {
            expectHttpsError(() => {
                Event.fromObject({
                    date: '2023-01-01T10:54:46.762Z',
                    title: 'asdf',
                    subtitle: 'qwer',
                    link: 12
                }, logger.nextIndent);
            }, 'internal');
        });

        it('no link', () => {
            const event = Event.fromObject({
                date: '2023-01-01T10:54:46.762Z',
                title: 'asdf',
                subtitle: 'qwer'
            }, logger.nextIndent);
            expect(event).to.be.deep.equal({
                date: new Date('2023-01-01T10:54:46.762Z'),
                title: 'asdf',
                subtitle: 'qwer',
                link: undefined
            });
        });

        it('undefined link', () => {
            const event = Event.fromObject({
                date: '2023-01-01T10:54:46.762Z',
                title: 'asdf',
                subtitle: 'qwer',
                link: undefined
            }, logger.nextIndent);
            expect(event).to.be.deep.equal({
                date: new Date('2023-01-01T10:54:46.762Z'),
                title: 'asdf',
                subtitle: 'qwer',
                link: undefined
            });
        });

        it('event guard invalid', () => {
            expect(EventGroupId.isValid('')).to.be.false;
            expect(EventGroupId.isValid('lkn')).to.be.false;
            expect(EventGroupId.isValid('klöa-sdfsd')).to.be.false;
        });

        it('event guard valid', () => {
            expect(EventGroupId.isValid('general')).to.be.true;
            expect(EventGroupId.isValid('football-adults/general')).to.be.true;
            expect(EventGroupId.isValid('football-adults/first-team')).to.be.true;
            expect(EventGroupId.isValid('football-adults/second-team')).to.be.true;
            expect(EventGroupId.isValid('football-adults/ah-team')).to.be.true;
            expect(EventGroupId.isValid('football-youth/general')).to.be.true;
            expect(EventGroupId.isValid('football-youth/c-youth')).to.be.true;
            expect(EventGroupId.isValid('football-youth/e-youth')).to.be.true;
            expect(EventGroupId.isValid('football-youth/f-youth')).to.be.true;
            expect(EventGroupId.isValid('football-youth/g-youth')).to.be.true;
            expect(EventGroupId.isValid('gymnastics')).to.be.true;
            expect(EventGroupId.isValid('dancing')).to.be.true;
        });
    });

    describe('guid builder', () => {
        it('valid guid lowercase', () => {
            const _guid = guid.fromString('7bdf6320-a47e-4af7-a8df-4f26e4ae2be6', logger.nextIndent);
            expect(_guid.guidString).to.be.equal('7BDF6320-A47E-4AF7-A8DF-4F26E4AE2BE6');
        });

        it('valid guid uppercase', () => {
            const _guid = guid.fromString('3069E8A1-AFF7-40D6-BD52-F8CF041A8365', logger.nextIndent);
            expect(_guid.guidString).to.be.equal('3069E8A1-AFF7-40D6-BD52-F8CF041A8365');
        });

        it('invalid guid 1', () => {
            expectHttpsError(() => {
                guid.fromString('3069E8A1-AFF7-A0D6-BD52-F8CF041A8365', logger.nextIndent);
            }, 'internal');
        });

        it('invalid guid 2', () => {
            expectHttpsError(() => {
                guid.fromString('3069E8A-AFF7-40D6-BD52-F8CF041A8365', logger.nextIndent);
            }, 'internal');
        });

        it('invalid guid 3', () => {
            expectHttpsError(() => {
                guid.fromString('3069E8A11-AFF7-40D6-BD52-F8CF041A8365', logger.nextIndent);
            }, 'internal');
        });

        it('invalid guid 4', () => {
            expectHttpsError(() => {
                guid.fromString('3069E8A1-AFF-40D6-BD52-F8CF041A8365', logger.nextIndent);
            }, 'internal');
        });

        it('invalid guid 5', () => {
            expectHttpsError(() => {
                guid.fromString('3069E8A1-AFF77-40D6-BD52-F8CF041A8365', logger.nextIndent);
            }, 'internal');
        });

        it('invalid guid 6', () => {
            expectHttpsError(() => {
                guid.fromString('3069E8A1-AFF7-40D-BD52-F8CF041A8365', logger.nextIndent);
            }, 'internal');
        });

        it('invalid guid 7', () => {
            expectHttpsError(() => {
                guid.fromString('3069E8A1-AFF7-40D66-BD52-F8CF041A8365', logger.nextIndent);
            }, 'internal');
        });

        it('invalid guid 8', () => {
            expectHttpsError(() => {
                guid.fromString('3069E8A1-AFF7-40D6-BD5-F8CF041A8365', logger.nextIndent);
            }, 'internal');
        });

        it('invalid guid 9', () => {
            expectHttpsError(() => {
                guid.fromString('3069E8A1-AFF7-40D6-BD522-F8CF041A8365', logger.nextIndent);
            }, 'internal');
        });

        it('invalid guid 10', () => {
            expectHttpsError(() => {
                guid.fromString('3069E8A1-AFF7-40D6-BD52-F8CF041A836', logger.nextIndent);
            }, 'internal');
        });

        it('invalid guid 11', () => {
            expectHttpsError(() => {
                guid.fromString('3069E8A1-AFF7-40D6-BD52-F8CF041A83655', logger.nextIndent);
            }, 'internal');
        });

        it('invalid guid 12', () => {
            expectHttpsError(() => {
                guid.fromString('3069E8A1-AFF7-40D6-BD52-F8CF0#1A8365', logger.nextIndent);
            }, 'internal');
        });

        it('new guid', () => {
            guid.newGuid();
        });
    });

    describe('news builder', () => {
        it('all properties', () => {
            const news = News.fromObject({
                title: 'a',
                subtitle: 'b',
                date: '2023-01-01T10:54:46.762Z',
                shortDescription: 'c',
                newsUrl: 'd',
                disabled: true,
                thumbnailUrl: 'e'
            }, logger.nextIndent);
            expect(news).to.be.deep.equal({
                title: 'a',
                subtitle: 'b',
                date: new Date('2023-01-01T10:54:46.762Z'),
                shortDescription: 'c',
                newsUrl: 'd',
                disabled: true,
                thumbnailUrl: 'e'
            });
        });

        it('invalid title type', () => {
            expectHttpsError(() => {
                News.fromObject({
                    title: 1,
                    subtitle: 'b',
                    date: '2023-01-01T10:54:46.762Z',
                    shortDescription: 'c',
                    newsUrl: 'd',
                    disabled: true,
                    thumbnailUrl: 'e'
                }, logger.nextIndent);
            }, 'internal');
        });

        it('no title', () => {
            expectHttpsError(() => {
                News.fromObject({
                    subtitle: 'b',
                    date: '2023-01-01T10:54:46.762Z',
                    shortDescription: 'c',
                    newsUrl: 'd',
                    disabled: true,
                    thumbnailUrl: 'e'
                }, logger.nextIndent);
            }, 'internal');
        });

        it('invalid subtitle type', () => {
            expectHttpsError(() => {
                News.fromObject({
                    title: 'a',
                    subtitle: 1,
                    date: '2023-01-01T10:54:46.762Z',
                    shortDescription: 'c',
                    newsUrl: 'd',
                    disabled: true,
                    thumbnailUrl: 'e'
                }, logger.nextIndent);
            }, 'internal');
        });

        it('no subtitle', () => {
            const news = News.fromObject({
                title: 'a',
                date: '2023-01-01T10:54:46.762Z',
                shortDescription: 'c',
                newsUrl: 'd',
                disabled: true,
                thumbnailUrl: 'e'
            }, logger.nextIndent);
            expect(news).to.be.deep.equal({
                title: 'a',
                subtitle: undefined,
                date: new Date('2023-01-01T10:54:46.762Z'),
                shortDescription: 'c',
                newsUrl: 'd',
                disabled: true,
                thumbnailUrl: 'e'
            });
        });

        it('subtitle undefined', () => {        
            const news = News.fromObject({
                title: 'a',
                date: '2023-01-01T10:54:46.762Z',
                shortDescription: 'c',
                newsUrl: 'd',
                disabled: true,
                thumbnailUrl: 'e'
            }, logger.nextIndent);
            expect(news).to.be.deep.equal({
                title: 'a',
                subtitle: undefined,
                date: new Date('2023-01-01T10:54:46.762Z'),
                shortDescription: 'c',
                newsUrl: 'd',
                disabled: true,
                thumbnailUrl: 'e'
            });
        });

        it('invalid date type', () => {
            expectHttpsError(() => {
                News.fromObject({
                    title: 'a',
                    subtitle: 'b',
                    date: 1,
                    shortDescription: 'c',
                    newsUrl: 'd',
                    disabled: true,
                    thumbnailUrl: 'e'
                }, logger.nextIndent);
            }, 'internal');
        });

        it('no date', () => {
            expectHttpsError(() => {
                News.fromObject({
                    title: 'a',
                    subtitle: 'b',
                    shortDescription: 'c',
                    newsUrl: 'd',
                    disabled: true,
                    thumbnailUrl: 'e'
                }, logger.nextIndent);
            }, 'internal');
        });

        it('invalid short description type', () => {
            expectHttpsError(() => {
                News.fromObject({
                    title: 'a',
                    subtitle: 'b',
                    date: '2023-01-01T10:54:46.762Z',
                    shortDescription: 1,
                    newsUrl: 'd',
                    disabled: true,
                    thumbnailUrl: 'e'
                }, logger.nextIndent);
            }, 'internal');
        });

        it('no short description', () => {
            const news = News.fromObject({
                title: 'a',
                subtitle: 'b',
                date: '2023-01-01T10:54:46.762Z',
                newsUrl: 'd',
                disabled: true,
                thumbnailUrl: 'e'
            }, logger.nextIndent);
            expect(news).to.be.deep.equal({
                title: 'a',
                subtitle: 'b',
                date: new Date('2023-01-01T10:54:46.762Z'),
                shortDescription: undefined,
                newsUrl: 'd',
                disabled: true,
                thumbnailUrl: 'e'
            });
        });

        it('short description undefined', () => {
            const news = News.fromObject({
                title: 'a',
                subtitle: 'b',
                date: '2023-01-01T10:54:46.762Z',
                shortDescription: undefined,
                newsUrl: 'd',
                disabled: true,
                thumbnailUrl: 'e'
            }, logger.nextIndent);
            expect(news).to.be.deep.equal({
                title: 'a',
                subtitle: 'b',
                date: new Date('2023-01-01T10:54:46.762Z'),
                shortDescription: undefined,
                newsUrl: 'd',
                disabled: true,
                thumbnailUrl: 'e'
            });
        });

        it('invalid news url type', () => {
            expectHttpsError(() => {
                News.fromObject({
                    title: 'a',
                    subtitle: 'b',
                    date: '2023-01-01T10:54:46.762Z',
                    shortDescription: 'c',
                    newsUrl: 1,
                    disabled: true,
                    thumbnailUrl: 'e'
                }, logger.nextIndent);
            }, 'internal');
        });

        it('no news url', () => {
            expectHttpsError(() => {
                News.fromObject({
                    title: 'a',
                    subtitle: 'b',
                    date: '2023-01-01T10:54:46.762Z',
                    shortDescription: 'c',
                    disabled: true,
                    thumbnailUrl: 'e'
                }, logger.nextIndent);
            }, 'internal');
        });

        it('invalid disabled type', () => {
            expectHttpsError(() => {
                News.fromObject({
                    title: 'a',
                    subtitle: 'b',
                    date: '2023-01-01T10:54:46.762Z',
                    shortDescription: 'c',
                    newsUrl: 'd',
                    disabled: 1,
                    thumbnailUrl: 'e'
                }, logger.nextIndent);
            }, 'internal');
        });

        it('no disabled', () => {
            expectHttpsError(() => {
                News.fromObject({
                    title: 'a',
                    subtitle: 'b',
                    date: '2023-01-01T10:54:46.762Z',
                    shortDescription: 'c',
                    newsUrl: 'd',
                    thumbnailUrl: 'e'
                }, logger.nextIndent);
            }, 'internal');
        });

        it('invalid thumbnail url type', () => {
            expectHttpsError(() => {
                News.fromObject({
                    title: 'a',
                    subtitle: 'b',
                    date: '2023-01-01T10:54:46.762Z',
                    shortDescription: 'c',
                    newsUrl: 'd',
                    disabled: true,
                    thumbnailUrl: 1
                }, logger.nextIndent);
            }, 'internal');
        });

        it('no thumbnail url', () => {
            expectHttpsError(() => {
                News.fromObject({
                    title: 'a',
                    subtitle: 'b',
                    date: '2023-01-01T10:54:46.762Z',
                    shortDescription: 'c',
                    newsUrl: 'd',
                    disabled: true
                }, logger.nextIndent);
            }, 'internal');
        });
    });

    describe('fiat shamir parameters', () => {
        it('valid', () => {
            const parameters = FiatShamirParameters.fromObject({
                identifier: '3FB9B206-DF47-44E0-95B5-59FC7EC50D8D',
                cs: [
                    0n, 1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n, 11n, 12n, 13n, 14n, 15n, 16n,
                    17n, 18n, 19n, 20n, 21n, 22n, 23n, 24n, 25n, 26n, 27n, 28n, 29n, 30n, 31n
                ]
            }, logger.nextIndent);
            expect(parameters).to.be.deep.equal({
                identifier: new guid('3FB9B206-DF47-44E0-95B5-59FC7EC50D8D'),
                cs: [
                    0n, 1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n, 11n, 12n, 13n, 14n, 15n, 16n,
                    17n, 18n, 19n, 20n, 21n, 22n, 23n, 24n, 25n, 26n, 27n, 28n, 29n, 30n, 31n
                ]
            });
        });

        it('no identifier', () => {
            expectHttpsError(() => {
                FiatShamirParameters.fromObject({
                    cs: [
                        0n, 1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n, 11n, 12n, 13n, 14n, 15n, 16n,
                        17n, 18n, 19n, 20n, 21n, 22n, 23n, 24n, 25n, 26n, 27n, 28n, 29n, 30n, 31n
                    ]
                }, logger.nextIndent);
            }, 'internal');
        });

        it('identifier no string', () => {
            expectHttpsError(() => {
                FiatShamirParameters.fromObject({
                    identifier: 12,
                    cs: [
                        0n, 1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n, 11n, 12n, 13n, 14n, 15n, 16n,
                        17n, 18n, 19n, 20n, 21n, 22n, 23n, 24n, 25n, 26n, 27n, 28n, 29n, 30n, 31n
                    ]
                }, logger.nextIndent);
            }, 'internal');
        });

        it('identifier no guid', () => {
            expectHttpsError(() => {
                FiatShamirParameters.fromObject({
                    identifier: 'asdf',
                    cs: [
                        0n, 1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n, 11n, 12n, 13n, 14n, 15n, 16n,
                        17n, 18n, 19n, 20n, 21n, 22n, 23n, 24n, 25n, 26n, 27n, 28n, 29n, 30n, 31n
                    ]
                }, logger.nextIndent);
            }, 'internal');
        });

        it('no cs', () => {
            expectHttpsError(() => {
                FiatShamirParameters.fromObject({
                    identifier: '3FB9B206-DF47-44E0-95B5-59FC7EC50D8D'
                }, logger.nextIndent);
            }, 'internal');
        });

        it('cs no object', () => {
            expectHttpsError(() => {
                FiatShamirParameters.fromObject({
                    identifier: '3FB9B206-DF47-44E0-95B5-59FC7EC50D8D',
                    cs: 1
                }, logger.nextIndent);
            }, 'internal');
        });

        it('cs null', () => {
            expectHttpsError(() => {
                FiatShamirParameters.fromObject({
                    identifier: '3FB9B206-DF47-44E0-95B5-59FC7EC50D8D',
                    cs: null
                }, logger.nextIndent);
            }, 'internal');
        });

        it('cs elemnt no bigint', () => {
            expectHttpsError(() => {
                FiatShamirParameters.fromObject({
                    identifier: '3FB9B206-DF47-44E0-95B5-59FC7EC50D8D',
                    cs: [
                        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
                        17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31
                    ]
                }, logger.nextIndent);
            }, 'internal');
        });

        it('cs not 32 elemets', () => {
            expectHttpsError(() => {
                FiatShamirParameters.fromObject({
                    identifier: '3FB9B206-DF47-44E0-95B5-59FC7EC50D8D',
                    cs: [
                        0n, 1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n, 11n, 12n, 13n, 14n, 15n, 16n,
                        17n, 18n, 19n, 20n, 21n, 22n, 23n, 24n, 25n, 26n, 27n, 28n, 29n, 30n, 31n, 32n
                    ]
                }, logger.nextIndent);
            }, 'internal');
        });
    });
});
