import { DDNetError, MapType } from '../../util.js';
import { ServerStats } from './ServerStats.js';

// This code screams "please end me"
// Surely there's a better way but I have no idea

/**
 * Wrapper class for all player server types.
 */
export class Servers {
  /**
   * Novice server stats.
   */
  public novice: ServerStats;

  /**
   * Moderate server stats.
   */
  public moderate: ServerStats;

  /**
   * Brutal server stats.
   */
  public brutal: ServerStats;

  /**
   * Insane server stats.
   */
  public insane: ServerStats;

  /**
   * Dummy server stats.
   */
  public dummy: ServerStats;

  /**
   * DDmaX.Easy server stats.
   */
  public ddmaxEasy: ServerStats;

  /**
   * DDmaX.Next server stats.
   */
  public ddmaxNext: ServerStats;

  /**
   * DDmaX.Pro server stats.
   */
  public ddmaxPro: ServerStats;

  /**
   * DDmaX.Nut server stats.
   */
  public ddmaxNut: ServerStats;

  /**
   * Oldschool server stats.
   */
  public oldschool: ServerStats;

  /**
   * Solo server stats.
   */
  public solo: ServerStats;

  /**
   * Race server stats.
   */
  public race: ServerStats;

  /**
   * Fun server stats.
   */
  public fun: ServerStats;

  constructor(data: ServerStats[]) {
    const novice = data.find(server => server.name === MapType.novice) ?? new DDNetError(`\`${MapType.novice}\` server not found in data!`);
    const moderate = data.find(server => server.name === MapType.moderate) ?? new DDNetError(`\`${MapType.moderate}\` server not found in data!`);
    const brutal = data.find(server => server.name === MapType.brutal) ?? new DDNetError(`\`${MapType.brutal}\` server not found in data!`);
    const insane = data.find(server => server.name === MapType.insane) ?? new DDNetError(`\`${MapType.insane}\` server not found in data!`);
    const dummy = data.find(server => server.name === MapType.dummy) ?? new DDNetError(`\`${MapType.dummy}\` server not found in data!`);
    const ddmaxEasy = data.find(server => server.name === MapType.ddmaxEasy) ?? new DDNetError(`\`${MapType.ddmaxEasy}\` server not found in data!`);
    const ddmaxNext = data.find(server => server.name === MapType.ddmaxNext) ?? new DDNetError(`\`${MapType.ddmaxNext}\` server not found in data!`);
    const ddmaxPro = data.find(server => server.name === MapType.ddmaxPro) ?? new DDNetError(`\`${MapType.ddmaxPro}\` server not found in data!`);
    const ddmaxNut = data.find(server => server.name === MapType.ddmaxNut) ?? new DDNetError(`\`${MapType.ddmaxNut}\` server not found in data!`);
    const oldschool = data.find(server => server.name === MapType.oldschool) ?? new DDNetError(`\`${MapType.oldschool}\` server not found in data!`);
    const solo = data.find(server => server.name === MapType.solo) ?? new DDNetError(`\`${MapType.solo}\` server not found in data!`);
    const race = data.find(server => server.name === MapType.race) ?? new DDNetError(`\`${MapType.race}\` server not found in data!`);
    const fun = data.find(server => server.name === MapType.fun) ?? new DDNetError(`\`${MapType.fun}\` server not found in data!`);

    const types = [novice, moderate, brutal, insane, dummy, ddmaxEasy, ddmaxNext, ddmaxPro, ddmaxNut, oldschool, solo, race, fun];

    if (types.some(item => item instanceof DDNetError))
      throw new DDNetError(
        `Invalid data!`,
        types.filter(i => i instanceof DDNetError)
      );

    this.novice = novice as ServerStats;
    this.moderate = moderate as ServerStats;
    this.brutal = brutal as ServerStats;
    this.insane = insane as ServerStats;
    this.dummy = dummy as ServerStats;
    this.ddmaxEasy = ddmaxEasy as ServerStats;
    this.ddmaxNext = ddmaxNext as ServerStats;
    this.ddmaxPro = ddmaxPro as ServerStats;
    this.ddmaxNut = ddmaxNut as ServerStats;
    this.oldschool = oldschool as ServerStats;
    this.solo = solo as ServerStats;
    this.race = race as ServerStats;
    this.fun = fun as ServerStats;
  }
}
