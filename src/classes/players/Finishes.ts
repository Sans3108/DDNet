import { Finish } from './Finish.js';
import { RecentFinish } from './RecentFinish.js';

/**
 * Wrapper class for a player's first and recent finishes.
 */
export class Finishes {
  /**
   * The very first finish of this player.
   */
  public first: Finish;

  /**
   * The most recent finishes of this player.
   */
  public recent: RecentFinish[];

  /**
   * Construct a new {@link Finishes} instance.
   */
  constructor(data: { first: Finish; recent: RecentFinish[] }) {
    this.first = data.first;
    this.recent = data.recent;
  }
}
