import { DDNetError, Type } from '../../util.js';
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
    const novice = data.find(server => server.name === Type.novice) ?? new DDNetError(`\`${Type.novice}\` server not found in data!`);
    const moderate = data.find(server => server.name === Type.moderate) ?? new DDNetError(`\`${Type.moderate}\` server not found in data!`);
    const brutal = data.find(server => server.name === Type.brutal) ?? new DDNetError(`\`${Type.brutal}\` server not found in data!`);
    const insane = data.find(server => server.name === Type.insane) ?? new DDNetError(`\`${Type.insane}\` server not found in data!`);
    const dummy = data.find(server => server.name === Type.dummy) ?? new DDNetError(`\`${Type.dummy}\` server not found in data!`);
    const ddmaxEasy = data.find(server => server.name === Type.ddmaxEasy) ?? new DDNetError(`\`${Type.ddmaxEasy}\` server not found in data!`);
    const ddmaxNext = data.find(server => server.name === Type.ddmaxNext) ?? new DDNetError(`\`${Type.ddmaxNext}\` server not found in data!`);
    const ddmaxPro = data.find(server => server.name === Type.ddmaxPro) ?? new DDNetError(`\`${Type.ddmaxPro}\` server not found in data!`);
    const ddmaxNut = data.find(server => server.name === Type.ddmaxNut) ?? new DDNetError(`\`${Type.ddmaxNut}\` server not found in data!`);
    const oldschool = data.find(server => server.name === Type.oldschool) ?? new DDNetError(`\`${Type.oldschool}\` server not found in data!`);
    const solo = data.find(server => server.name === Type.solo) ?? new DDNetError(`\`${Type.solo}\` server not found in data!`);
    const race = data.find(server => server.name === Type.race) ?? new DDNetError(`\`${Type.race}\` server not found in data!`);
    const fun = data.find(server => server.name === Type.fun) ?? new DDNetError(`\`${Type.fun}\` server not found in data!`);

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
