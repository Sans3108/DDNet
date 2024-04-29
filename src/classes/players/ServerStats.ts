import { MapType } from '../../util.js';
import { Leaderboard } from './Leaderboard.js';
import { CompletedMapStats, UncompletedMapStats } from './MapStats.js';

/**
 * Represents player server stats.
 */
export class ServerStats {
  /**
   * The name of this server.
   */
  public name: MapType;

  /**
   * Player leaderboard stats for this server.
   */
  public leaderboard: Leaderboard;

  /**
   * Total points obtainable across all maps on this server.
   */
  public totalCompletionistPoints: number;

  /**
   * Player map stats for this server.
   */
  public maps: (CompletedMapStats | UncompletedMapStats)[];

  /**
   * Construct a new {@link ServerStats} instance.
   */
  constructor(data: { name: MapType; leaderboard: Leaderboard; totalCompletionistPoints: number; maps: (CompletedMapStats | UncompletedMapStats)[] }) {
    this.name = data.name;
    this.leaderboard = data.leaderboard;
    this.totalCompletionistPoints = data.totalCompletionistPoints;
    this.maps = data.maps;
  }
}
