import { PlayerRankingRanked, PlayerRankingUnranked } from './PlayerRanking.js';

/**
 * Class representing a player's server leaderboard stats.
 */
export class PlayerLeaderboard {
  /**
   * Player completionist ranking for this server.
   */
  public completionist: PlayerRankingRanked | PlayerRankingUnranked;

  /**
   * Player team ranking for this server.
   */
  public team: PlayerRankingRanked | PlayerRankingUnranked;

  /**
   * Player ranking for this server.
   */
  public rank: PlayerRankingRanked | PlayerRankingUnranked;

  constructor(data: { completionist: PlayerRankingRanked | PlayerRankingUnranked; team: PlayerRankingRanked | PlayerRankingUnranked; rank: PlayerRankingRanked | PlayerRankingUnranked }) {
    this.completionist = data.completionist;
    this.rank = data.rank;
    this.team = data.team;
  }
}
