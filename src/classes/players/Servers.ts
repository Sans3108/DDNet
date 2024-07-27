import { DDNetError, Type } from '../../util.js';
import { ServerStats } from './ServerStats.js';

/**
 * Wrapper class for all player server types.
 */
export class Servers {
  /**
   * Novice server stats.
   */
  public [Type.novice]!: ServerStats;

  /**
   * Moderate server stats.
   */
  public [Type.moderate]!: ServerStats;

  /**
   * Brutal server stats.
   */
  public [Type.brutal]!: ServerStats;

  /**
   * Insane server stats.
   */
  public [Type.insane]!: ServerStats;

  /**
   * Dummy server stats.
   */
  public [Type.dummy]!: ServerStats;

  /**
   * DDmaX.Easy server stats.
   */
  public [Type.ddmaxEasy]!: ServerStats;

  /**
   * DDmaX.Next server stats.
   */
  public [Type.ddmaxNext]!: ServerStats;

  /**
   * DDmaX.Pro server stats.
   */
  public [Type.ddmaxPro]!: ServerStats;

  /**
   * DDmaX.Nut server stats.
   */
  public [Type.ddmaxNut]!: ServerStats;

  /**
   * Oldschool server stats.
   */
  public [Type.oldschool]!: ServerStats;

  /**
   * Solo server stats.
   */
  public [Type.solo]!: ServerStats;

  /**
   * Race server stats.
   */
  public [Type.race]!: ServerStats;

  /**
   * Fun server stats.
   */
  public [Type.fun]!: ServerStats;

  constructor(data: ServerStats[]) {
    for (const k in Type) {
      const key = k as keyof typeof Type;

      if (key === 'unknown') continue;

      const stats = data.find(server => server.name === Type[key]);

      if (!stats) throw new DDNetError(`\`${Type[key]}\` server not found in data!`);

      this[Type[key]] = stats;
    }
  }
}
