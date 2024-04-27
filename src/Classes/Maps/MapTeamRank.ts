import { Player } from '../players/Player.js';
import { MapBaseRank } from './MapBaseRank.js';

/**
 * Class representing a map team ranking.
 */
export class MapTeamRank extends MapBaseRank {
  /**
   * An array of player names along with a `toPlayer` function to turn them into proper {@link Player} objects.
   */
  public players: { name: string; toPlayer: () => Promise<Player> }[];

  constructor(data: ConstructorParameters<typeof MapBaseRank>[0] & { players: string[] }) {
    super(data);
    this.players = data.players.map(p => ({
      name: p,
      toPlayer: async () => await Player.new(p)
    }));
  }
}
