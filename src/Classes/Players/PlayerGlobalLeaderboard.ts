import { PlayerLeaderboard } from './PlayerLeaderboard.js';
import { PlayerRanking, PlayerRankingRanked } from './PlayerRanking.js';

export class PlayerGlobalLeaderboard extends PlayerLeaderboard {
  public completionistLastMonth: PlayerRanking;
  public completionistLastWeek: PlayerRanking;

  constructor(data: { completionist: PlayerRankingRanked; completionistLastMonth: PlayerRanking; completionistLastWeek: PlayerRanking; team: PlayerRanking; rank: PlayerRanking }) {
    super(data);

    this.completionistLastMonth = data.completionistLastMonth;
    this.completionistLastWeek = data.completionistLastWeek;
  }
}
