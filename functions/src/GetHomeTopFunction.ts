import * as admin from 'firebase-admin';

import { DebugProperties } from './AnpfiffInfoData/DebugProperties';
import { WebsiteFetcher } from './AnpfiffInfoData/Fetchers/WebsiteFetcher';
import { TeamParameters } from './AnpfiffInfoData/Parameters/TeamParameters';
import { isTeamParameters } from './AnpfiffInfoData/Parameters/TeamParameters.guard';
import { TeamSpiele, TeamSpieleSpiele } from './AnpfiffInfoData/Parsers/TeamSpiele/TeamSpiele';
import { TeamSpieleParser } from './AnpfiffInfoData/Parsers/TeamSpiele/TeamSpieleParser';
import { DBPlayer } from './DBPlayer/DBPlayer';
import { Logger } from './Logger/Logger';
import { LogLevel } from './Logger/LogLevel';
import { ParameterContainer } from './ParameterContainer';
import { FirebaseFunction, httpsError } from './utils';
import { Datum } from './utils/Datum';
import { FullDatum } from './utils/FullDatum';
import { Time } from './utils/Time';

export class GetHomeTopFunction
  implements
    FirebaseFunction<
      [
        {
          player?: DBPlayer;
          image?: string;
        }[],
        {
          last?: TeamSpieleSpiele;
          next?: TeamSpieleSpiele;
        },
        {
          last?: TeamSpieleSpiele;
          next?: TeamSpieleSpiele;
        },
      ]
    >
{
  public constructor(private logger: Logger) {}

  public static fromData(data: any) {
    const parameterContainer = new ParameterContainer(data);
    const logger = Logger.start(parameterContainer, 'GetHomeTopFunction.constructor', { data: data }, LogLevel.notice);
    return new GetHomeTopFunction(logger);
  }

  /**
   * Executes this firebase function.
   */
  async executeFunction(): Promise<
    [
      {
        player: DBPlayer;
        image?: string;
      }[],
      {
        last?: TeamSpieleSpiele;
        next?: TeamSpieleSpiele;
      },
      {
        last?: TeamSpieleSpiele;
        next?: TeamSpieleSpiele;
      },
    ]
  > {
    this.logger.append('GetHomeTopFunction.executeFunction', undefined, LogLevel.info);

    return await Promise.all([
      this.getPersonWithLastDateOfBirth(),
      this.getLastNextTeamSpiel('first-team'),
      this.getLastNextTeamSpiel('second-team'),
    ]);
  }

  /*
  private async getAllDBPlayers(): Promise<DBPlayer[]> {
    this.logger.append('GetHomeTopFunction.getAllDBPlayers', undefined);
    const firebaseFunction = new GetAllDBPlayersFunction(this.logger.nextIndent);
    const allPlayers = await firebaseFunction.executeFunction();
    this.logger.append('GetHomeTopFunction.getAllDBPlayers', { allPlayers });
    return allPlayers;
  }
  */

  private async getPersonWithLastDateOfBirth(): Promise<
    {
      player: DBPlayer;
      image?: string;
    }[]
  > {
    return [];
    /*
    this.logger.append('GetHomeTopFunction.getPersonWithLastDateOfBirth', undefined);
    const today = Datum.fromDate(new Date());
    let lastInYearPlayer: DBPlayer[] | undefined = undefined;
    let currentLastPlayer: DBPlayer[] | undefined = undefined;
    for (const player of await this.getAllDBPlayers()) {
      const diff1 = lastInYearPlayer?.[0].dateOfBirth.compareOnlyMonthDay(player.dateOfBirth) ?? -1;
      if (diff1 == 0) {
        lastInYearPlayer?.push(player);
      } else if (diff1 < 0) {
        lastInYearPlayer = [player];
      }
      if (player.dateOfBirth.compareOnlyMonthDay(today) <= 0) {
        const diff2 = currentLastPlayer?.[0].dateOfBirth.compareOnlyMonthDay(player.dateOfBirth) ?? -1;
        if (diff2 == 0) {
          currentLastPlayer?.push(player);
        } else if (diff2 < 0) {
          currentLastPlayer = [player];
        }
      }
    }
    this.logger.append('GetHomeTopFunction.getPersonWithLastDateOfBirth', { currentLastPlayer, lastInYearPlayer });
    const players = currentLastPlayer ?? lastInYearPlayer;
    if (players === undefined) {
      return [];
    }
    const allPlayers: Promise<{
      player: DBPlayer;
      image?: string;
    }>[] = [];
    for (const player of players) {
      allPlayers.push(
        (async () => {
          if (player.id == undefined) {
            return {
              player: player,
            };
          }
          const imageName = await getDBPlayerImageName(player.id, [DBPlayerImageSource.inAction]);
          return {
            player: player,
            image: imageName,
          };
        })(),
      );
    }
      return await Promise.all(allPlayers);
      */
  }

  private async getTeamParameters(team: 'first-team' | 'second-team'): Promise<TeamParameters> {
    this.logger.append('GetHomeTopFunction.getTeamParameters', { team });
    const reference = admin.database().ref(`anpfiffParameters/teamParameters/${team}`);
    const snapshot = await reference.once('value');
    if (!snapshot.exists()) {
      throw httpsError(
        'internal',
        `Couldn't get team parameters for '${team}', no data exists in snapshot.`,
        this.logger,
      );
    }
    const parameters = snapshot.val();
    this.logger.append('GetHomeTopFunction.getTeamParameters', { parameters });
    if (!isTeamParameters(parameters)) {
      throw httpsError('internal', `Couldn't get team parameters for '${team}'.`, this.logger);
    }
    return parameters;
  }

  private async getTeamSpiele(team: 'first-team' | 'second-team'): Promise<TeamSpiele> {
    this.logger.append('GetHomeTopFunction.getTeamSpiele', { team });
    const parser = new TeamSpieleParser();
    const fetcher = new WebsiteFetcher(parser, new DebugProperties(false));
    await fetcher.intitialize(await this.getTeamParameters(team));
    const teamSpiele = (await fetcher.fetch()).value;
    this.logger.append('GetHomeTopFunction.getTeamSpiele', { teamSpiele });
    return teamSpiele;
  }

  private async getLastNextTeamSpiel(
    team: 'first-team' | 'second-team',
  ): Promise<{ last?: TeamSpieleSpiele; next?: TeamSpieleSpiele }> {
    this.logger.append('GetHomeTopFunction.getLastNextTeamSpiel', { team });
    const teamSpiele = await this.getTeamSpiele(team);
    const allGames = [...(teamSpiele.spiele ?? []), ...(teamSpiele.vorbereitungsSpiele ?? [])];
    for (const spiel of allGames) {
      this.logger.append('--test--', { datum: spiel.date ?? 'undefined' });
    }
    const today = FullDatum.fromDate(new Date());
    let lastSpiel: TeamSpieleSpiele | undefined = undefined;
    let nextSpiel: TeamSpieleSpiele | undefined = undefined;
    for (const spiel of allGames) {
      if (spiel.date == undefined) continue;
      const spielDate = new FullDatum(
        new Datum(spiel.date.datum.year, spiel.date.datum.month, spiel.date.datum.day),
        new Time(spiel.date.time.hour, spiel.date.time.minute),
      );
      const lastSpielDate =
        lastSpiel?.date == undefined
          ? undefined
          : new FullDatum(
              new Datum(lastSpiel.date.datum.year, lastSpiel.date.datum.month, lastSpiel.date.datum.day),
              new Time(lastSpiel.date.time.hour, lastSpiel.date.time.minute),
            );
      const nextSpielDate =
        nextSpiel?.date == undefined
          ? undefined
          : new FullDatum(
              new Datum(nextSpiel.date.datum.year, nextSpiel.date.datum.month, nextSpiel.date.datum.day),
              new Time(nextSpiel.date.time.hour, nextSpiel.date.time.minute),
            );
      if (spielDate.compareTo(today) <= 0 && (lastSpielDate == undefined || lastSpielDate.compareTo(spielDate) < 0)) {
        lastSpiel = spiel;
      }
      if (spielDate.compareTo(today) >= 0 && (nextSpielDate == undefined || nextSpielDate.compareTo(spielDate) > 0)) {
        nextSpiel = spiel;
      }
    }
    this.logger.append('GetHomeTopFunction.getLastNextTeamSpiel', { lastSpiel, nextSpiel });
    return { last: lastSpiel, next: nextSpiel };
  }
}
