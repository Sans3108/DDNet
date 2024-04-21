export interface PlayerRankingUnranked {
  rank: null;
}

export interface PlayerRankingRanked {
  rank: number;
  points: number;
}

export type PlayerRanking = PlayerRankingRanked | PlayerRankingUnranked;
