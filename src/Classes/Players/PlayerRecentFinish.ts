import { Map, MapType, PlayerFinish } from '@classes';
import { DDNetError } from '@util';

export class PlayerRecentFinish extends PlayerFinish {
  public server: string;
  public mapType: MapType;

  constructor(data: ConstructorParameters<typeof PlayerFinish>[0] & { server: string; mapType: MapType }) {
    super(data);
    this.server = data.server;
    this.mapType = data.mapType;
  }

  public async toMap(): Promise<{ success: true; instance: Map } | { success: false; error: DDNetError }> {
    return await Map.new(this.mapName);
  }
}
