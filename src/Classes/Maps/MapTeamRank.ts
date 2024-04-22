import { MapBaseRank, Player } from '@classes';
import { DDNetError } from '@util';

export class MapTeamRank extends MapBaseRank {
  public players: { name: string; toPlayer: () => Promise<{ success: true; instance: Player } | { success: false; error: DDNetError }> }[];

  constructor(data: ConstructorParameters<typeof MapBaseRank>[0] & { players: string[] }) {
    super(data);
    this.players = data.players.map(p => ({
      name: p,
      toPlayer: async () => await Player.new(p)
    }));
  }
}
