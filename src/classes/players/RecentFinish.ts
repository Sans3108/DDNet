import { Type } from '../../util.js';
import { Finish } from '../other/Finish.js';

/**
 * Represents a player recent finish.
 */
export class RecentFinish extends Finish {
  /**
   * The type of the map.
   */
  public mapType: Type;

  /**
   * Construct a new {@link RecentFinish} instance.
   */
  constructor(data: ConstructorParameters<typeof Finish>[0] & { mapType: Type }) {
    super(data);
    this.mapType = data.mapType;
  }
}
