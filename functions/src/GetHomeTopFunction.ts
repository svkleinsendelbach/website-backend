import * as admin from 'firebase-admin';

import { DebugProperties } from './AnpfiffInfoData/DebugProperties';
import { WebsiteFetcher } from './AnpfiffInfoData/Fetchers/WebsiteFetcher';
import { TeamParameters } from './AnpfiffInfoData/Parameters/TeamParameters';
import { isTeamParameters } from './AnpfiffInfoData/Parameters/TeamParameters.guard';
import { TeamSpiele, TeamSpieleSpiele } from './AnpfiffInfoData/Parsers/TeamSpiele/TeamSpiele';
import { TeamSpieleParser } from './AnpfiffInfoData/Parsers/TeamSpiele/TeamSpieleParser';
import { DBPlayer } from './DBPlayer/DBPlayer';
import { GetAllDBPlayersFunction } from './GetAllDBPlayersFunction';
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
        DBPlayer | undefined,
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
      DBPlayer | undefined,
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

    const properties = await Promise.all([
      this.getPersonWithLastDateOfBirth(),
      this.getLastNextTeamSpiel('ersteMannschaft'),
      this.getLastNextTeamSpiel('zweiteMannschaft'),
    ]);
    return properties;
  }

  private async getAllDBPlayers(): Promise<DBPlayer[]> {
    this.logger.append('GetHomeTopFunction.getAllDBPlayers', undefined);
    const firebaseFunction = new GetAllDBPlayersFunction(this.logger.nextIndent);
    const allPlayers = await firebaseFunction.executeFunction();
    this.logger.append('GetHomeTopFunction.getAllDBPlayers', { allPlayers });
    return allPlayers;
  }

  private async getPersonWithLastDateOfBirth(): Promise<DBPlayer | undefined> {
    this.logger.append('GetHomeTopFunction.getPersonWithLastDateOfBirth', undefined);
    const today = Datum.fromDate(new Date());
    let lastInYearPlayer: DBPlayer | undefined = undefined;
    let currentLastPlayer: DBPlayer | undefined = undefined;
    for (const player of await this.getAllDBPlayers()) {
      if ((lastInYearPlayer?.dateOfBirth.compareOnlyMonthDay(player.dateOfBirth) ?? -1) < 0) {
        lastInYearPlayer = player;
      }
      if (
        (currentLastPlayer?.dateOfBirth.compareOnlyMonthDay(player.dateOfBirth) ?? -1) < 0 &&
        player.dateOfBirth.compareOnlyMonthDay(today) <= 0
      ) {
        currentLastPlayer = player;
      }
    }
    this.logger.append('GetHomeTopFunction.getPersonWithLastDateOfBirth', { currentLastPlayer, lastInYearPlayer });
    return currentLastPlayer ?? lastInYearPlayer;
  }

  private async getTeamParameters(team: 'ersteMannschaft' | 'zweiteMannschaft'): Promise<TeamParameters> {
    this.logger.append('GetHomeTopFunction.getTeamParameters', { team });
    const reference = admin.database().ref(`clubProperties/${team}/parameters`);
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

  private async getTeamSpiele(team: 'ersteMannschaft' | 'zweiteMannschaft'): Promise<TeamSpiele> {
    this.logger.append('GetHomeTopFunction.getTeamSpiele', { team });
    const parser = new TeamSpieleParser();
    const fetcher = new WebsiteFetcher(parser, await this.getTeamParameters(team), new DebugProperties(false));
    const teamSpiele = (await fetcher.fetch()).value;
    this.logger.append('GetHomeTopFunction.getTeamSpiele', { teamSpiele });
    return teamSpiele;
  }

  private async getLastNextTeamSpiel(
    team: 'ersteMannschaft' | 'zweiteMannschaft',
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
