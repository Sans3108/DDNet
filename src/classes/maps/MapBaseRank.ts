import { ServerRegion, timeString } from '../../util.js';

/**
 * Base class representing a map rank.
 */
export class MapBaseRank {
  /**
   * The obtained rank.
   */
  public rank: number;

  /**
   * The time of this record in seconds.
   */
  public timeSeconds: number;

  /**
   * The time of this record in DDNet time string format. (ex. 03:23)
   */
  public timeString: string;

  /**
   * The timestamp for this record.
   */
  public timestamp: number;

  /**
   * The server region where this record was achieved.
   */
  public server: ServerRegion;

  constructor(data: { rank: number; timeSeconds: number; timestamp: number; server: string }) {
    this.rank = data.rank;
    this.timeSeconds = data.timeSeconds;
    this.timeString = timeString(this.timeSeconds);
    this.timestamp = data.timestamp;

    if (data.server in ServerRegion) {
      this.server = ServerRegion[data.server as keyof typeof ServerRegion] ?? ServerRegion.UNK;
    } else this.server = ServerRegion.UNK;
  }
}
