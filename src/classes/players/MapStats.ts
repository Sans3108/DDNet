import { RankAvailableRegion, Type, timeString } from '../../util.js';
import { Map } from '../maps/Map.js';

/**
 * Base class representing a player's map stats.
 */
export abstract class MapStatsBase {
  /**
   * The map name.
   */
  public mapName: string;

  /**
   * The server type of this map.
   */
  public mapType: Type;

  /**
   * The amount of points awarded for completing this map.
   */
  public points: number;

  constructor(data: { mapName: string; mapType: Type; pointsReward: number }) {
    this.mapName = data.mapName;
    this.mapType = data.mapType;
    this.points = data.pointsReward;
  }

  /**
   * Returns a new {@link Map} object from the {@link mapName} of this finish.
   */
  public async toMap(
    /**
     * The region to pull ranks from in the `toMap` function from the returned value. Omit for global ranks.
     */
    rankSource?: RankAvailableRegion | null,
    /**
     * Wether to bypass the cache.
     */
    force = false
  ): Promise<Map> {
    return await Map.new(this.mapName, rankSource, force);
  }
}

/**
 * Represents a player's unfinished map stats.
 */
export class UncompletedMapStats extends MapStatsBase {
  /**
   * The amount of finishes on this map.
   *
   * @remarks This will always be 0.
   */
  public finishCount: number;

  /**
   * Construct a new {@link UncompletedMapStats} instance.
   */
  constructor(data: ConstructorParameters<typeof MapStatsBase>[0]) {
    super(data);
    this.finishCount = 0;
  }
}

/**
 * Represents a player's finished map stats.
 */
export class CompletedMapStats extends MapStatsBase {
  /**
   * The placement obtained on this map.
   */
  public placement: number;

  /**
   * Timestamp for the first ever finish on this map.
   */
  public firstFinishTimestamp: number;

  /**
   * Best finish time for this map in seconds.
   */
  public bestTimeSeconds: number;

  /**
   * The string formatted best finish time for this map.
   *
   * @example "03:23"
   */
  public bestTimeString: string;

  /**
   * The amount of finishes on this map.
   */
  public finishCount: number;

  /**
   * The team rank obtained on this map.
   */
  public teamRank: number | null;

  /**
   * Construct a new {@link CompletedMapStats} instance.
   */
  constructor(
    data: ConstructorParameters<typeof MapStatsBase>[0] & {
      rank: number;
      firstFinishTimestamp: number;
      bestTimeSeconds: number;
      finishCount: number;
      teamRank?: number;
    }
  ) {
    super(data);

    this.placement = data.rank;
    this.firstFinishTimestamp = data.firstFinishTimestamp;
    this.bestTimeSeconds = data.bestTimeSeconds;
    this.bestTimeString = timeString(this.bestTimeSeconds);
    this.finishCount = data.finishCount;
    this.teamRank = data.teamRank ?? null;
  }
}

/**
 * Helper function to assert if a given map stats object is {@link CompletedMapStats}.
 */
export function isCompletedMapStats(stats: UncompletedMapStats | CompletedMapStats): stats is CompletedMapStats {
  return stats instanceof CompletedMapStats && stats.finishCount > 0;
}
