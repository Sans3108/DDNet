import { DDNetError, timeString } from '../../util.js';
import { Map } from '../Maps/Map.js';

export class PlayerFinish {
  public timestamp: number;
  public mapName: string;
  public timeSeconds: number;
  public timeString: string;

  constructor(data: { timestamp: number; mapName: string; timeSeconds: number }) {
    this.timestamp = data.timestamp;
    this.mapName = data.mapName;
    this.timeSeconds = data.timeSeconds;
    this.timeString = timeString(this.timeSeconds);
  }

  public async toMap(): Promise<{ success: true; instance: Map } | { success: false; error: DDNetError }> {
    return await Map.new(this.mapName);
  }
}
