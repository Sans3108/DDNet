import { Rank } from './Rank.js';

/**
 * Represents server leaderboard stats.
 */
export class Leaderboard {
  /**
   * Player completionist ranking for this server.
   */
  public completionist: Rank | null;

  /**
   * Player team rank for this server.
   */
  public team: Rank | null;

  /**
   * Player rank for this server.
   */
  public rank: Rank | null;

  /**
   * Construct a new {@link Leaderboard} instance.
   */
  constructor(data: { completionist: Rank | null; team: Rank | null; rank: Rank | null }) {
    this.completionist = data.completionist;
    this.rank = data.rank;
    this.team = data.team;
  }
}
