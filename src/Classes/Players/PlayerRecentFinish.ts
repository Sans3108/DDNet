import { PlayerFinish } from '@classes';

export class PlayerRecentFinish extends PlayerFinish {
  public server: string;
  public mapType: string;

  constructor(data: ConstructorParameters<typeof PlayerFinish>[0] & { server: string; mapType: string }) {
    super(data);
    this.server = data.server;
    this.mapType = data.mapType;
  }
}
