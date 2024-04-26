import { ServerRegion, timeString } from '../../util.js';

export class MapBaseRank {
  public rank: number;
  public timeSeconds: number;
  public timeString: string;
  public timestamp: number;
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
