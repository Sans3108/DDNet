import { PlayerFinish } from './PlayerFinish.js';
import { PlayerRecentFinish } from './PlayerRecentFinish.js';

export class PlayerFinishes {
  public first: PlayerFinish;
  public recent: PlayerRecentFinish[];

  constructor(data: { first: PlayerFinish; recent: PlayerRecentFinish[] }) {
    this.first = data.first;
    this.recent = data.recent;
  }
}
