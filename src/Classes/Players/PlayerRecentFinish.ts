import { DDNetError, MapType, ServerRegion } from '../../util.js';
import { Map } from '../Maps/Map.js';
import { PlayerFinish } from './PlayerFinish.js';

export class PlayerRecentFinish extends PlayerFinish {
  public server: ServerRegion;
  public mapType: MapType;

  constructor(data: ConstructorParameters<typeof PlayerFinish>[0] & { server: string; mapType: MapType }) {
    super(data);
    this.server = ServerRegion[data.server as keyof typeof ServerRegion] ?? ServerRegion.UNK;
    this.mapType = data.mapType;
  }

  public async toMap(): Promise<{ success: true; instance: Map } | { success: false; error: DDNetError }> {
    return await Map.new(this.mapName);
  }
}