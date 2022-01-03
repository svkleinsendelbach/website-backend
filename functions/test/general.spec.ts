import * as fs from 'fs';

import { TeamSpieleSpiele } from '../src/AnpfiffInfoData/Parsers/TeamSpiele/TeamSpiele';
import { Datum } from '../src/utils/Datum';
import { FullDatum } from '../src/utils/FullDatum';
import { Time } from '../src/utils/Time';
import { callFunction } from './utils';

const spiele: TeamSpieleSpiele[] = [
  {
    date: new FullDatum(new Datum(2022, 3, 20), new Time(15, 0)),
    logoId: 110768,
    homeAway: 'H',
    opponent: 'SV Pretzfeld 2',
    result: '_:_',
    resultParameters: {
      spielkreis: 2,
      liga: 202,
      spiel: 741139,
      verein: 329,
      teamHeim: 25458,
      teamAway: 1141,
      top: 0,
      ticker: 0,
      men: 19,
    },
    sonderwertung: false,
  },
  {
    date: new FullDatum(new Datum(2021, 11, 6), new Time(13, 15)),
    logoId: 60322,
    homeAway: 'A',
    opponent: '1. FC Eschenau 3',
    result: '1:2',
    resultParameters: {
      spielkreis: 2,
      liga: 202,
      spiel: 741112,
      verein: 282,
      teamHeim: 1579,
      teamAway: 25458,
      top: 0,
      ticker: 0,
      men: 19,
    },
    sonderwertung: false,
  },
  {
    date: new FullDatum(new Datum(2021, 11, 14), new Time(12, 30)),
    logoId: 60619,
    homeAway: 'H',
    opponent: 'SC Uttenreuth 2',
    result: '0:1',
    resultParameters: {
      spielkreis: 2,
      liga: 202,
      spiel: 741118,
      verein: 329,
      teamHeim: 25458,
      teamAway: 542,
      top: 0,
      ticker: 0,
      men: 19,
    },
    sonderwertung: false,
  },
  {
    date: new FullDatum(new Datum(2022, 3, 13), new Time(13, 0)),
    logoId: 543957,
    homeAway: 'A',
    opponent: '(SG) Wimmelbach 2/Hausen 2',
    result: '_:_',
    resultParameters: {
      spielkreis: 2,
      liga: 202,
      spiel: 741128,
      verein: 313,
      teamHeim: 30576,
      teamAway: 25458,
      top: 0,
      ticker: 0,
      men: 19,
    },
    sonderwertung: false,
  },
];

describe('general', () => {
  it('getAllDBPlayers', async () => {
    console.log(await callFunction('getAllDBPlayers'));
  });

  it('getHomeTop', async () => {
    const result = await callFunction('getHomeTop', { verbose: true });
    console.log(result[0]);
    fs.writeFileSync('./log.ans', result[1], 'utf-8');
  });

  it('test', () => {
    const today = FullDatum.fromDate(new Date());
    let lastSpiel: TeamSpieleSpiele | undefined = undefined;
    let nextSpiel: TeamSpieleSpiele | undefined = undefined;
    for (const spiel of spiele) {
      if (spiel.date == undefined) continue;
      if (spiel.date.compareTo(today) <= 0) {
        if (lastSpiel?.date == undefined || lastSpiel.date.compareTo(spiel.date) < 0) {
          lastSpiel = spiel;
        }
      }
      if (spiel.date.compareTo(today) >= 0) {
        if (nextSpiel?.date == undefined || nextSpiel.date.compareTo(spiel.date) > 0) {
          nextSpiel = spiel;
        }
      }
    }
    console.log({ last: lastSpiel, next: nextSpiel });
  });
});
