import { MapBaseRank, Player } from '@classes';
import { DDNetError } from '@util';

export class MapRank extends MapBaseRank {
  public player: string;

  constructor(data: ConstructorParameters<typeof MapBaseRank>[0] & { player: string }) {
    super(data);
    this.player = data.player;
  }

  public async toPlayer(): Promise<{ success: true; instance: Player } | { success: false; error: DDNetError }> {
    return await Player.new(this.player);
  }
}
