import { PlayerFinish } from './PlayerFinish.js';
import { PlayerRecentFinish } from './PlayerRecentFinish.js';

/**
 * Wrapper class for a player's first and recent finishes.
 */
export class PlayerFinishes {
  /**
   * The first ever finish of this player.
   */
  public first: PlayerFinish;

  /**
   * The most recent finishes of this player.
   */
  public recent: PlayerRecentFinish[];

  constructor(data: { first: PlayerFinish; recent: PlayerRecentFinish[] }) {
    this.first = data.first;
    this.recent = data.recent;
  }
}
