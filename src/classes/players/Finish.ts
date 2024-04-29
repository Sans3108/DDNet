import { timeString } from '../../util.js';
import { Map } from '../maps/Map.js';

/**
 * Represents a player finish.
 */
export class Finish {
  /**
   * The timestamp of this finish.
   */
  public timestamp: number;

  /**
   * The name of the map.
   */
  public mapName: string;

  /**
   * The time in seconds of this finish.
   */
  public timeSeconds: number;

  /**
   * The string formatted time of this finish.
   *
   * @example "03:23"
   */
  public timeString: string;

  /**
   * Construct a new {@link Finish} instance.
   */
  constructor(data: { timestamp: number; mapName: string; timeSeconds: number }) {
    this.timestamp = data.timestamp;
    this.mapName = data.mapName;
    this.timeSeconds = data.timeSeconds;
    this.timeString = timeString(this.timeSeconds);
  }

  /**
   * Returns a new {@link Map} object from the {@link mapName} of this finish.
   */
  public async toMap(): Promise<Map> {
    return await Map.new(this.mapName);
  }
}
