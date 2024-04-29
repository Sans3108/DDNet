import { MapType, ServerRegion } from '../../util.js';
import { Finish } from './Finish.js';

/**
 * Represents a player recent finish.
 */
export class RecentFinish extends Finish {
  /**
   * The server region of this finish.
   */
  public server: ServerRegion;

  /**
   * The type of the map.
   */
  public mapType: MapType;

  /**
   * Construct a new {@link RecentFinish} instance.
   */
  constructor(data: ConstructorParameters<typeof Finish>[0] & { server: string; mapType: MapType }) {
    super(data);
    this.server = ServerRegion[data.server as keyof typeof ServerRegion] ?? ServerRegion.UNK;
    this.mapType = data.mapType;
  }
}
