import { MapBaseRank } from '@classes';

export class MapTeamRank extends MapBaseRank {
  public players: string[];

  constructor(data: ConstructorParameters<typeof MapBaseRank>[0] & { players: string[] }) {
    super(data);
    this.players = data.players;
  }
}
