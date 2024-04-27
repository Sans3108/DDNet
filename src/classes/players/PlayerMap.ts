import { MapType, timeString } from '../../util.js';
import { Map } from '../maps/Map.js';

/**
 * Base class representing a player map status.
 */
export class PlayerMapBase {
  /**
   * The map name.
   */
  public mapName: string;

  /**
   * The server type of this map.
   */
  public mapType: MapType;

  /**
   * The amount of points rewarded for this map.
   */
  public pointsReward: number;

  constructor(data: { mapName: string; mapType: MapType; pointsReward: number }) {
    this.mapName = data.mapName;
    this.mapType = data.mapType;
    this.pointsReward = data.pointsReward;
  }

  public async toMap(): Promise<Map> {
    return await Map.new(this.mapName);
  }
}

/**
 * Class representing a player map that's unfinished.
 */
export class UnfinishedPlayerMap extends PlayerMapBase {
  /**
   * The amount of finishes on this map.
   */
  public finishCount: 0 = 0;

  constructor(data: ConstructorParameters<typeof PlayerMapBase>[0]) {
    super(data);
  }
}

/**
 * Class representing a player map that was finished.
 */
export class FinishedPlayerMap extends PlayerMapBase {
  /**
   * The rank obtained on this map.
   */
  public rank: number;

  /**
   * Timestamp for the first finish on this map.
   */
  public firstFinishTimestamp: number;

  /**
   * Best finish time for this map in seconds.
   */
  public bestTimeSeconds: number;

  /**
   * Best finish time for this map in DDNet time string format (ex. 23:32)
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

  constructor(
    data: ConstructorParameters<typeof PlayerMapBase>[0] & {
      rank: number;
      firstFinishTimestamp: number;
      bestTimeSeconds: number;
      finishCount: number;
      teamRank?: number;
    }
  ) {
    super(data);

    this.rank = data.rank;
    this.firstFinishTimestamp = data.firstFinishTimestamp;
    this.bestTimeSeconds = data.bestTimeSeconds;
    this.bestTimeString = timeString(this.bestTimeSeconds);
    this.finishCount = data.finishCount;
    this.teamRank = data.teamRank ?? null;
  }
}
