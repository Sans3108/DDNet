/**
 * Base class representing a player ranking.
 */
export class PlayerRankingBase {
  /**
   * The rank obtained.
   */
  public rank: number | null;

  /**
   * The points obtained.
   */
  public points?: number;

  constructor(data: { rank: null } | { rank: number; points: number }) {
    this.rank = data.rank;

    if ('points' in data) this.points = data.points;
  }
}

/**
 * Class representing an unranked status.
 */
export class PlayerRankingUnranked extends PlayerRankingBase {
  public rank: null;

  constructor() {
    super({ rank: null });

    delete this.points; // undefined still shows up when logged for no reason, so just delete the key

    this.rank = null;
  }
}

/**
 * Class representing a ranked status.
 */
export class PlayerRankingRanked extends PlayerRankingBase {
  public rank: number;
  public points: number;

  constructor(data: { rank: number; points: number }) {
    super(data);

    this.rank = data.rank;
    this.points = data.points;
  }
}
