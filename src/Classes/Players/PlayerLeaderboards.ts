import { PlayerRanking, PlayerRankingRanked } from 'Classes/Players';

export class PlayerLeaderboards {
  public completionist: PlayerRankingRanked;
  public completionistLastMonth: PlayerRanking;
  public completionistLastWeek: PlayerRanking;
  public team: PlayerRanking;
  public rank: PlayerRanking;

  constructor(data: { completionist: PlayerRankingRanked; completionistLastMonth: PlayerRanking; completionistLastWeek: PlayerRanking; team: PlayerRanking; rank: PlayerRanking }) {
    this.completionist = data.completionist;
    this.completionistLastMonth = data.completionistLastMonth;
    this.completionistLastWeek = data.completionistLastWeek;
    this.rank = data.rank;
    this.team = data.team;
  }
}
