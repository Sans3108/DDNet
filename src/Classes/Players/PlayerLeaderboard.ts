import { PlayerRanking } from './PlayerRanking.js';

export class PlayerLeaderboard {
  public completionist: PlayerRanking;
  public team: PlayerRanking;
  public rank: PlayerRanking;

  constructor(data: { completionist: PlayerRanking; team: PlayerRanking; rank: PlayerRanking }) {
    this.completionist = data.completionist;
    this.rank = data.rank;
    this.team = data.team;
  }
}
