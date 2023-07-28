import { expect } from "firebase-function/lib/src/testUtils";
import { UtcDate } from "../src/types/UtcDate";

describe('utcDate', () => {
    it('timezone', () => {
        const date = new UtcDate(2023, 1, 1, 12, 0, 'Europe/Berlin');
        expect(date).to.be.deep.equal(new UtcDate(2023, 1, 1, 12, 0));
    });

    it('from date', () => {
        const date = UtcDate.fromDate(new Date('2023-02-07T12:34:56+01:00'));
        expect(date).to.be.deep.equal(new UtcDate(2023, 2, 7, 11, 34));
    });

    it('encode decode', () => {
        const date = UtcDate.fromDate(new Date('2023-02-07T12:34:56+01:00'));
        const encoded = date.encoded;
        expect(encoded).to.be.equal('2023-02-07-11-34');
        expect(UtcDate.decode(encoded)).to.be.deep.equal(date);
    });

    it('setted', () => {
        const date = UtcDate.fromDate(new Date('2023-02-07T12:34:56+01:00'));
        let newDate = date.setted({ year: 2022, month: 5, day: 1 });
        expect(newDate).to.be.deep.equal(new UtcDate(2022, 5, 1, 11, 34));
        newDate = date.setted({ hour: 0, minute: 0 });
        expect(newDate).to.be.deep.equal(new UtcDate(2023, 2, 7, 0, 0));
        newDate = date.setted({ month: 1, day: 40, minute: 65 });
        expect(newDate).to.be.deep.equal(new UtcDate(2023, 2, 9, 12, 5));
    });

    it('advanced', () => {
        const date = UtcDate.fromDate(new Date('2023-02-07T12:34:56+01:00'));
        let newDate = date.advanced({ year: 1, month: 1, day: 1 });
        expect(newDate).to.be.deep.equal(new UtcDate(2024, 3, 8, 11, 34));
        newDate = date.advanced({ hour: 4, minute: 2 });
        expect(newDate).to.be.deep.equal(new UtcDate(2023, 2, 7, 15, 36));
        newDate = date.advanced({ month: 1, day: 30, minute: 30 });
        expect(newDate).to.be.deep.equal(new UtcDate(2023, 4, 6, 12, 4));
    });

    it('compare', () => {
        const date1 = UtcDate.fromDate(new Date('2024-02-07T12:34:56+01:00'));
        const date2 = UtcDate.fromDate(new Date('2023-02-08T12:34:56+01:00'));
        const date3 = UtcDate.fromDate(new Date('2023-02-07T12:35:56+01:00'));
        const date4 = UtcDate.fromDate(new Date('2023-02-07T12:34:56+01:00'));
        expect(date1.compare(date2)).to.be.equal('greater');
        expect(date1.compare(date3)).to.be.equal('greater');
        expect(date1.compare(date4)).to.be.equal('greater');
        expect(date2.compare(date3)).to.be.equal('greater');
        expect(date2.compare(date4)).to.be.equal('greater');
        expect(date3.compare(date4)).to.be.equal('greater');
        expect(date1.compare(date1)).to.be.equal('equal');
        expect(date2.compare(date1)).to.be.equal('less');
        expect(date3.compare(date1)).to.be.equal('less');
        expect(date4.compare(date1)).to.be.equal('less');
        expect(date3.compare(date2)).to.be.equal('less');
        expect(date4.compare(date2)).to.be.equal('less');
        expect(date4.compare(date3)).to.be.equal('less');
    });

    it('itetate', () => {
        const date1 = UtcDate.fromDate(new Date('2023-03-02T02:34:56+01:00'));
        const date2 = UtcDate.fromDate(new Date('2023-02-26T12:25:56+01:00'));
        expect(UtcDate.iterateDates(date1, date2)).to.be.deep.equal([]);
        expect(UtcDate.iterateDates(date1, date1)).to.be.deep.equal([
            new UtcDate(2023, 3, 2, 0, 0)
        ]);
        expect(UtcDate.iterateDates(date2, date1)).to.be.deep.equal([
            new UtcDate(2023, 2, 26, 0, 0),
            new UtcDate(2023, 2, 27, 0, 0),
            new UtcDate(2023, 2, 28, 0, 0),
            new UtcDate(2023, 3, 1, 0, 0),
            new UtcDate(2023, 3, 2, 0, 0)
        ]);
    });
});