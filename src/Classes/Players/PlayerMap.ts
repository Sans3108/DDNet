import { timeString } from '@util';

export class PlayerMapBase {
  public mapName: string;
  public mapType: string;
  public points: number;

  constructor(data: { mapName: string; mapType: string; points: number }) {
    this.mapName = data.mapName;
    this.mapType = data.mapType;
    this.points = data.points;
  }
}

export class UnfinishedPlayerMap extends PlayerMapBase {
  public finishCount: 0 = 0;

  constructor(data: ConstructorParameters<typeof PlayerMapBase>[0]) {
    super(data);
  }
}

export class FinishedPlayerMap extends PlayerMapBase {
  public rank: number;
  public firstFinishTimestamp: number;
  public bestTimeSeconds: number;
  public bestTimeString: string;
  public finishCount: number;
  public teamRank: number | null;

  constructor(
    data: ConstructorParameters<typeof PlayerMapBase>[0] & {
      rank: number;
      firstFinishTimestamp: number;
      bestTimeSeconds: number;
      finishCount: number;
      teamRank?: number;
    }
  ) {
    super(data);

    this.rank = data.rank;
    this.firstFinishTimestamp = data.firstFinishTimestamp;
    this.bestTimeSeconds = data.bestTimeSeconds;
    this.bestTimeString = timeString(this.bestTimeSeconds);
    this.finishCount = data.finishCount;
    this.teamRank = data.teamRank ?? null;
  }
}

export type PlayerMap = FinishedPlayerMap | UnfinishedPlayerMap;
