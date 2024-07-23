import { timeString } from '../../util.js';
import { Player } from '../players/Player.js';

/**
 * Represents a player's highest amount of finishes on a map.
 */
export class MaxFinish {
  /**
   * The obtained rank.
   */
  public rank: number;

  /**
   * The name of the player which achieved this rank.
   */
  public player: string;

  /**
   * The amount of times this map has been finished by the player.
   */
  public count: number;

  /**
   * Total time from all runs in seconds.
   */
  public timeSeconds: number;

  /**
   * Total time from all runs in DDNet time string format. (ex. 02:47:23)
   */
  public timeString: string;

  /**
   * Could be the timestamp of the first time this map was finished.
   * @remarks I haven't figured out what minTimestamp is supposed to represent.
   */
  public minTimestamp: number;

  /**
   * Could be the timestamp of the last time this map was finished.
   * @remarks I haven't figured out what minTimestamp is supposed to represent.
   */
  public maxTimestamp: number;

  constructor(data: { rank: number; player: string; count: number; time: number; minTimestamp: number; maxTimestamp: number }) {
    this.rank = data.rank;
    this.player = data.player;
    this.count = data.count;
    this.timeSeconds = data.time;
    this.timeString = timeString(this.timeSeconds);
    this.minTimestamp = data.minTimestamp;
    this.maxTimestamp = data.maxTimestamp;
  }

  /**
   * Returns a new {@link Player} object from this rank.
   */
  public async toPlayer(): Promise<Player> {
    return await Player.new(this.player);
  }
}
