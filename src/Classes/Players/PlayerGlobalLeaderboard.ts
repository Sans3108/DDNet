import { PlayerLeaderboard } from './PlayerLeaderboard.js';
import { PlayerRankingRanked, PlayerRankingUnranked } from './PlayerRanking.js';

/**
 * Class representing a player's global leaderboard stats.
 */
export class PlayerGlobalLeaderboard extends PlayerLeaderboard {
  /**
   * Player ranking for last month.
   */
  public completionistLastMonth: PlayerRankingRanked | PlayerRankingUnranked;

  /**
   * Player ranking for last week.
   */
  public completionistLastWeek: PlayerRankingRanked | PlayerRankingUnranked;

  constructor(data: { completionist: PlayerRankingRanked; completionistLastMonth: PlayerRankingRanked | PlayerRankingUnranked; completionistLastWeek: PlayerRankingRanked | PlayerRankingUnranked; team: PlayerRankingRanked | PlayerRankingUnranked; rank: PlayerRankingRanked | PlayerRankingUnranked }) {
    super(data);

    this.completionistLastMonth = data.completionistLastMonth;
    this.completionistLastWeek = data.completionistLastWeek;
  }
}
