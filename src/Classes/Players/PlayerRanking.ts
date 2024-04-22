export class PlayerRankingBase {
  public rank: number | null;
  public points?: number;

  constructor(data: { rank: null } | { rank: number; points: number }) {
    this.rank = data.rank;

    if ('points' in data) this.points = data.points;
  }
}

export class PlayerRankingUnranked extends PlayerRankingBase {
  public rank: null;

  constructor() {
    super({ rank: null });

    delete this.points; // undefined still shows up for no reason, so just delete the key

    this.rank = null;
  }
}

export class PlayerRankingRanked extends PlayerRankingBase {
  public rank: number;
  public points: number;

  constructor(data: { rank: number; points: number }) {
    super(data);

    this.rank = data.rank;
    this.points = data.points;
  }
}

export type PlayerRanking = PlayerRankingRanked | PlayerRankingUnranked;
