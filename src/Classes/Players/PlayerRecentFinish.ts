import { MapType, ServerRegion } from '../../util.js';
import { PlayerFinish } from './PlayerFinish.js';

/**
 * Class representing a player map recent finish.
 */
export class PlayerRecentFinish extends PlayerFinish {
  /**
   * The server region of this finish.
   */
  public server: ServerRegion;

  /**
   * The type of the map.
   */
  public mapType: MapType;

  constructor(data: ConstructorParameters<typeof PlayerFinish>[0] & { server: string; mapType: MapType }) {
    super(data);
    this.server = ServerRegion[data.server as keyof typeof ServerRegion] ?? ServerRegion.UNK;
    this.mapType = data.mapType;
  }
}
