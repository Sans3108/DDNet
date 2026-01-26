import { DDNetError } from '../../util.js';
import { ServerStats } from './ServerStats.js';

/**
 * Represents the different DDNet server types.
 */
export enum ServerType {
  novice = 'Novice',
  moderate = 'Moderate',
  brutal = 'Brutal',
  insane = 'Insane',
  dummy = 'Dummy',
  ddmaxEasy = 'DDmaX.Easy',
  ddmaxNext = 'DDmaX.Next',
  ddmaxPro = 'DDmaX.Pro',
  ddmaxNut = 'DDmaX.Nut',
  oldschool = 'Oldschool',
  solo = 'Solo',
  race = 'Race',
  fun = 'Fun',
  unknown = 'UNKNOWN'
}

/**
 * Wrapper class for all player server types.
 */
export class Servers {
  /**
   * Novice server stats.
   */
  public [ServerType.novice]!: ServerStats;

  /**
   * Moderate server stats.
   */
  public [ServerType.moderate]!: ServerStats;

  /**
   * Brutal server stats.
   */
  public [ServerType.brutal]!: ServerStats;

  /**
   * Insane server stats.
   */
  public [ServerType.insane]!: ServerStats;

  /**
   * Dummy server stats.
   */
  public [ServerType.dummy]!: ServerStats;

  /**
   * DDmaX.Easy server stats.
   */
  public [ServerType.ddmaxEasy]!: ServerStats;

  /**
   * DDmaX.Next server stats.
   */
  public [ServerType.ddmaxNext]!: ServerStats;

  /**
   * DDmaX.Pro server stats.
   */
  public [ServerType.ddmaxPro]!: ServerStats;

  /**
   * DDmaX.Nut server stats.
   */
  public [ServerType.ddmaxNut]!: ServerStats;

  /**
   * Oldschool server stats.
   */
  public [ServerType.oldschool]!: ServerStats;

  /**
   * Solo server stats.
   */
  public [ServerType.solo]!: ServerStats;

  /**
   * Race server stats.
   */
  public [ServerType.race]!: ServerStats;

  /**
   * Fun server stats.
   */
  public [ServerType.fun]!: ServerStats;

  constructor(data: ServerStats[]) {
    for (const k in ServerType) {
      const key = k as keyof typeof ServerType;

      if (key === 'unknown') continue;

      const stats = data.find(server => server.name === ServerType[key]);

      if (!stats) throw new DDNetError(`\`${ServerType[key]}\` server not found in data!`);

      this[ServerType[key]] = stats;
    }
  }
}
