import { DDNetError } from '../../util.js';
import { Player } from '../Players/Player.js';
import { MapBaseRank } from './MapBaseRank.js';

export class MapTeamRank extends MapBaseRank {
  public players: { name: string; toPlayer: () => Promise<Player> }[];

  constructor(data: ConstructorParameters<typeof MapBaseRank>[0] & { players: string[] }) {
    super(data);
    this.players = data.players.map(p => ({
      name: p,
      toPlayer: async () => await Player.new(p)
    }));
  }
}
