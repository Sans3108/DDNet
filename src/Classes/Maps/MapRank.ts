import { Player } from '../Players/Player.js';
import { MapBaseRank } from './MapBaseRank.js';

export class MapRank extends MapBaseRank {
  public player: string;

  constructor(data: ConstructorParameters<typeof MapBaseRank>[0] & { player: string }) {
    super(data);
    this.player = data.player;
  }

  public async toPlayer(): Promise<Player> {
    return await Player.new(this.player);
  }
}
