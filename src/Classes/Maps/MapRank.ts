import { MapBaseRank } from '@classes';

export class MapRank extends MapBaseRank {
  public player: string;

  constructor(data: ConstructorParameters<typeof MapBaseRank>[0] & { player: string }) {
    super(data);
    this.player = data.player;
  }
}
