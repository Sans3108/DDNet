import { PlayerRankingRanked, PlayerRankingUnranked } from './PlayerRanking.js';

/**
 * Class representing a player's server leaderboard stats.
 */
export class PlayerLeaderboard {
  public completionist: PlayerRankingRanked | PlayerRankingUnranked;
  public team: PlayerRankingRanked | PlayerRankingUnranked;
  public rank: PlayerRankingRanked | PlayerRankingUnranked;

  constructor(data: { completionist: PlayerRankingRanked | PlayerRankingUnranked; team: PlayerRankingRanked | PlayerRankingUnranked; rank: PlayerRankingRanked | PlayerRankingUnranked }) {
    this.completionist = data.completionist;
    this.rank = data.rank;
    this.team = data.team;
  }
}
