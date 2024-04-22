import { PlayerLeaderboard, PlayerRanking, PlayerRankingRanked } from '@classes';

export class PlayerGlobalLeaderboard extends PlayerLeaderboard {
  public completionistLastMonth: PlayerRanking;
  public completionistLastWeek: PlayerRanking;

  constructor(data: { completionist: PlayerRankingRanked; completionistLastMonth: PlayerRanking; completionistLastWeek: PlayerRanking; team: PlayerRanking; rank: PlayerRanking }) {
    super(data);

    this.completionistLastMonth = data.completionistLastMonth;
    this.completionistLastWeek = data.completionistLastWeek;
  }
}
