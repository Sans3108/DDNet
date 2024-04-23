import { PlayerLeaderboard, PlayerMap } from '@classes';
import { MapType } from '@util';

export class PlayerServerType {
  public name: MapType;
  public leaderboard: PlayerLeaderboard;
  public totalCompletionistPoints: number;
  public maps: PlayerMap[];

  constructor(data: { name: MapType; leaderboard: PlayerLeaderboard; totalCompletionistPoints: number; maps: PlayerMap[] }) {
    this.name = data.name;
    this.leaderboard = data.leaderboard;
    this.totalCompletionistPoints = data.totalCompletionistPoints;
    this.maps = data.maps;
  }
}
