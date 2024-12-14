import { RankAvailableRegion, Type, formatStringList, timeString } from '../../util.js';
import { Map } from '../maps/Map.js';
import { Player } from '../players/Player.js';
import { Rank } from '../players/Rank.js';

/**
 * Represents a finish.
 */
export class Finish {
  /**
   * The timestamp of this finish.
   */
  public timestamp: number;

  /**
   * The name of the finished map.
   */
  public mapName: string;

  /**
   * The time of this finish in seconds.
   */
  public timeSeconds: number;

  /**
   * The string formatted time of this finish.
   *
   * @example "03:23"
   */
  public timeString: string;

  /**
   * The rank obtained.
   */
  public rank: Rank;

  /**
   * The region of this finish.
   */
  public region: RankAvailableRegion;

  /**
   * The finish player(s).
   */
  public players: { name: string; toPlayer: () => Promise<Player> }[];

  /**
   * Construct a new {@link Finish} instance.
   */
  constructor(data: { timestamp: number; mapName: string; timeSeconds: number; rank: Rank; region: RankAvailableRegion; players: string[] }) {
    this.timestamp = data.timestamp;
    this.mapName = data.mapName;
    this.timeSeconds = data.timeSeconds;
    this.timeString = timeString(this.timeSeconds);
    this.rank = data.rank;
    this.region = data.region;
    this.players = data.players.map(p => ({
      name: p,
      toPlayer: async () => await Player.new(p)
    }));
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

  /**
   * Returns the names of the players and their finish time.
   *
   * @example "Sans3108 | 03:23"
   */
  public toString(): string {
    return `${formatStringList(this.players.map(p => p.name))} | ${this.timeString}`;
  }
}

/**
 * Represents a player recent finish.
 */
export class RecentFinish extends Finish {
  /**
   * The type of the map.
   */
  public mapType: Type;

  /**
   * Construct a new {@link RecentFinish} instance.
   */
  constructor(data: ConstructorParameters<typeof Finish>[0] & { mapType: Type }) {
    super(data);
    this.mapType = data.mapType;
  }
}
