import { Player } from '@classes';
import { DDNetError, timeString } from '@util';

export class MapMaxFinish {
  public rank: number;
  public player: string;
  public count: number;
  public timeSeconds: number;
  public timeString: string;
  public minTimestamp: number;
  public maxTimestamp: number;

  constructor(data: { rank: number; player: string; count: number; time: number; minTimestamp: number; maxTimestamp: number }) {
    this.rank = data.rank;
    this.player = data.player;
    this.count = data.count;
    this.timeSeconds = data.time;
    this.timeString = timeString(this.timeSeconds);
    this.minTimestamp = data.minTimestamp;
    this.maxTimestamp = data.maxTimestamp;
  }

  public async toPlayer(): Promise<{ success: true; instance: Player } | { success: false; error: DDNetError }> {
    return await Player.new(this.player);
  }
}
