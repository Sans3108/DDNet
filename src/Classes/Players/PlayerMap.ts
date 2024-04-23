import { Map } from '@classes';
import { DDNetError, MapType, timeString } from '@util';

export class PlayerMapBase {
  public mapName: string;
  public mapType: MapType;
  public pointsReward: number;

  constructor(data: { mapName: string; mapType: MapType; pointsReward: number }) {
    this.mapName = data.mapName;
    this.mapType = data.mapType;
    this.pointsReward = data.pointsReward;
  }

  public async toMap(): Promise<{ success: true; instance: Map } | { success: false; error: DDNetError }> {
    return await Map.new(this.mapName);
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
