import { expect } from 'chai';

import { Datum } from '../src/utils/Datum';

describe('datum', () => {
  it('invalid regex', () => {
    expect(() => {
      Datum.fromString('2022/01', /^(?<year>\d{4})\/(?<month>\d{2})$/);
    }).to.throw("Regex must contain capturing groups with name 'year', 'month' and 'day'.");
    expect(() => {
      Datum.fromString('2022/01/01/02', /^(?<year>\d{4})\/(?<month>\d{2})\/(?<day>\d{2})\/(?<day>\d{2})$/);
    }).to.throw(
      'Invalid regular expression: /^(?<year>\\d{4})\\/(?<month>\\d{2})\\/(?<day>\\d{2})\\/(?<day>\\d{2})$/: Duplicate capture group name',
    );
  });

  it('invalid type', () => {
    expect(() => {
      Datum.fromValue(null);
    }).to.throw("Couldn't parse datum from value: 'null' (object). Expected type string.");
    expect(() => {
      Datum.fromValue(undefined);
    }).to.throw("Couldn't parse datum from value: 'undefined' (undefined). Expected type string.");
    expect(() => {
      Datum.fromValue(32187);
    }).to.throw("Couldn't parse datum from value: '32187' (number). Expected type string.");
    expect(() => {
      Datum.fromValue({ datum: '2022/01/01' });
    }).to.throw('Couldn\'t parse datum from value: \'{"datum":"2022/01/01"}\' (object). Expected type string.');
    expect(() => {
      Datum.fromValue(false);
    }).to.throw("Couldn't parse datum from value: 'false' (boolean). Expected type string.");
  });

  it('invalid format', () => {
    expect(() => {
      Datum.fromString('');
    }).to.throw("Couldn't parse datum from string value: ''. Expected format: yyyy/mm/dd.");
    expect(() => {
      Datum.fromString('2022/1/1');
    }).to.throw("Couldn't parse datum from string value: '2022/1/1'. Expected format: yyyy/mm/dd.");
    expect(() => {
      Datum.fromString('01/01/2022');
    }).to.throw("Couldn't parse datum from string value: '01/01/2022'. Expected format: yyyy/mm/dd.");
    expect(() => {
      Datum.fromString('2022-01-01');
    }).to.throw("Couldn't parse datum from string value: '2022-01-01'. Expected format: yyyy/mm/dd.");
    expect(() => {
      Datum.fromString('202a/01/01');
    }).to.throw("Couldn't parse datum from string value: '202a/01/01'. Expected format: yyyy/mm/dd.");
    expect(() => {
      Datum.fromString('-2022/01/01');
    }).to.throw("Couldn't parse datum from string value: '-2022/01/01'. Expected format: yyyy/mm/dd.");
    expect(() => {
      Datum.fromString('2022/-01/01');
    }).to.throw("Couldn't parse datum from string value: '2022/-01/01'. Expected format: yyyy/mm/dd.");
    expect(() => {
      Datum.fromString('2022/01/-01');
    }).to.throw("Couldn't parse datum from string value: '2022/01/-01'. Expected format: yyyy/mm/dd.");
    expect(() => {
      Datum.fromString('2022/01/011');
    }).to.throw("Couldn't parse datum from string value: '2022/01/011'. Expected format: yyyy/mm/dd.");
  });

  it('invalid year / month / day', () => {
    expect(() => {
      Datum.fromString('2022/13/01');
    }).to.throw("Couldn't parse datum from string value: '2022/13/01'. Expected month between 1 and 12.");
    expect(() => {
      Datum.fromString('2022/00/01');
    }).to.throw("Couldn't parse datum from string value: '2022/00/01'. Expected month between 1 and 12.");
    expect(() => {
      Datum.fromString('2022/01/00');
    }).to.throw("Couldn't parse datum from string value: '2022/01/00'. Expected day to be greater 0.");
    for (const value of [
      '2022/01/32',
      '2022/03/32',
      '2022/04/31',
      '2022/05/32',
      '2022/06/31',
      '2022/07/32',
      '2022/08/32',
      '2022/09/31',
      '2022/10/32',
      '2022/11/31',
      '2022/12/32',
    ]) {
      expect(() => {
        Datum.fromString(value);
      }).to.throw(`Couldn't parse datum from string value: '${value}'. Expected day to be less or equal than 30 / 31.`);
    }
    expect(() => {
      Datum.fromString('2022/02/29');
    }).to.throw(
      "Couldn't parse datum from string value: '2022/02/29'. Expected day to be less or equal than 28 on february.",
    );
    expect(() => {
      Datum.fromString('2020/02/30');
    }).to.throw(
      "Couldn't parse datum from string value: '2020/02/30'. Expected day to be less or equal than 29 on fabruary in a lap year.",
    );
    expect(() => {
      Datum.fromString('1900/02/29');
    }).to.throw(
      "Couldn't parse datum from string value: '1900/02/29'. Expected day to be less or equal than 28 on february.",
    );
    expect(() => {
      Datum.fromString('2000/02/30');
    }).to.throw(
      "Couldn't parse datum from string value: '2000/02/30'. Expected day to be less or equal than 29 on fabruary in a lap year.",
    );
  });

  it('valid dates', () => {
    expect(Datum.fromString('0000/01/01')).to.be.deep.equal(new Datum(0, 1, 1));
    expect(Datum.fromString('2022/01/01')).to.be.deep.equal(new Datum(2022, 1, 1));
    expect(Datum.fromString('2022/01/31')).to.be.deep.equal(new Datum(2022, 1, 31));
    expect(Datum.fromString('2022/04/01')).to.be.deep.equal(new Datum(2022, 4, 1));
    expect(Datum.fromString('2022/04/30')).to.be.deep.equal(new Datum(2022, 4, 30));
    expect(Datum.fromString('2022/02/01')).to.be.deep.equal(new Datum(2022, 2, 1));
    expect(Datum.fromString('2022/02/28')).to.be.deep.equal(new Datum(2022, 2, 28));
    expect(Datum.fromString('2020/02/29')).to.be.deep.equal(new Datum(2020, 2, 29));
    expect(Datum.fromString('1900/02/28')).to.be.deep.equal(new Datum(1900, 2, 28));
    expect(Datum.fromString('2000/02/29')).to.be.deep.equal(new Datum(2000, 2, 29));
    expect(Datum.fromString('2022/12/31')).to.be.deep.equal(new Datum(2022, 12, 31));
  });
});
