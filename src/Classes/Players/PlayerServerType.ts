import { MapType } from '../../util.js';
import { PlayerLeaderboard } from './PlayerLeaderboard.js';
import { FinishedPlayerMap, UnfinishedPlayerMap } from './PlayerMap.js';

/**
 * Class representing player server stats.
 */
export class PlayerServerType {
  /**
   * The name of this server type.
   */
  public name: MapType;

  /**
   * Player stats leaderboard for this server.
   */
  public leaderboard: PlayerLeaderboard;

  /**
   * Total points obtainable across all maps on this server.
   */
  public totalCompletionistPoints: number;

  /**
   * Player map stats for this server.
   */
  public maps: (FinishedPlayerMap | UnfinishedPlayerMap)[];

  constructor(data: { name: MapType; leaderboard: PlayerLeaderboard; totalCompletionistPoints: number; maps: (FinishedPlayerMap | UnfinishedPlayerMap)[] }) {
    this.name = data.name;
    this.leaderboard = data.leaderboard;
    this.totalCompletionistPoints = data.totalCompletionistPoints;
    this.maps = data.maps;
  }
}
