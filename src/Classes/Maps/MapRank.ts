import { Player } from '../Players/Player.js';
import { MapBaseRank } from './MapBaseRank.js';

/**
 * Class representing a map ranking.
 */
export class MapRank extends MapBaseRank {
  /**
   * The name of the player.
   */
  public player: string;

  constructor(data: ConstructorParameters<typeof MapBaseRank>[0] & { player: string }) {
    super(data);
    this.player = data.player;
  }

  /**
   * Return a new {@link Player} object from this rank.
   */
  public async toPlayer(): Promise<Player> {
    return await Player.new(this.player);
  }
}
