import * as functions from 'firebase-functions';

import { Datum } from '../utils/Datum';
import { isDBPlayer } from './DBPlayer.guard';

/** @see {isDBPlayer} ts-auto-guard:type-guard */
export interface DBPlayer {
  id: number;
  name: string;
  dateOfBirth: Datum;
}

export namespace DBPlayer {
  export function fromValue(value: any, id: string): DBPlayer {
    const player: DBPlayer = {
      id: Number(id),
      name: value.name,
      dateOfBirth: Datum.fromValue(value.dateOfBirth),
    };
    if (!isDBPlayer(player)) {
      throw new functions.https.HttpsError(
        'internal',
        `Couldn't parse BDPlayer from value: '${JSON.stringify(value)}'.`,
      );
    }
    return player;
  }
}
