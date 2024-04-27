import { timeString } from '../../util.js';
import { Map } from '../maps/Map.js';

/**
 * Class representing a player map finish.
 */
export class PlayerFinish {
  /**
   * Finish date timestamp.
   */
  public timestamp: number;
  /**
   * The name of the map finished.
   */
  public mapName: string;
  /**
   * The time in seconds of this finish.
   */
  public timeSeconds: number;
  /**
   * The time of this finish in DDNet-like time string. (ex. 03:23)
   */
  public timeString: string;

  constructor(data: { timestamp: number; mapName: string; timeSeconds: number }) {
    this.timestamp = data.timestamp;
    this.mapName = data.mapName;
    this.timeSeconds = data.timeSeconds;
    this.timeString = timeString(this.timeSeconds);
  }

  /**
   * Returns a new {@link Map} object from the {@link PlayerFinish.mapName name} of this finish.
   */
  public async toMap(): Promise<Map> {
    return await Map.new(this.mapName);
  }
}
