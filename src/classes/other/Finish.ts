import { Region, timeString } from '../../util.js';
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
  public region: Region;

  /**
   * The finish player(s).
   */
  public players: { name: string; toPlayer: () => Promise<Player> }[];

  /**
   * Construct a new {@link Finish} instance.
   */
  constructor(data: { timestamp: number; mapName: string; timeSeconds: number; rank: Rank; region: Region; players: string[] }) {
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
  public async toMap(): Promise<Map> {
    return await Map.new(this.mapName);
  }
}
