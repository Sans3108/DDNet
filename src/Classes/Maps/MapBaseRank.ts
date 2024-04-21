import { timeString } from '@util';

export class MapBaseRank {
  public rank: number;
  public timeSeconds: number;
  public timeString: string;
  public timestamp: number;
  public country: string;

  constructor(data: { rank: number; timeSeconds: number; timestamp: number; country: string }) {
    this.rank = data.rank;
    this.timeSeconds = data.timeSeconds;
    this.timeString = timeString(this.timeSeconds);
    this.timestamp = data.timestamp;
    this.country = data.country;
  }
}
