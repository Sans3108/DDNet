import { PlayerFinish, PlayerRecentFinish } from 'Classes/Players';

export class PlayerFinishes {
  public first: PlayerFinish;
  public recent: PlayerRecentFinish[];

  constructor(data: { first: PlayerFinish; recent: PlayerRecentFinish[] }) {
    this.first = data.first;
    this.recent = data.recent;
  }
}
