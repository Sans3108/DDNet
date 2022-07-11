import fetch from "node-fetch";

export type _Rank = 'unranked' | number;

export type _Points = {
  points?: number;
  rank: _Rank;
}

export type _PointsWithTotal = _Points & {
  total: number;
}

export type _MapType = 'Novice' | 'Moderate' | 'Brutal' | 'Insane' | 'Dummy' | 'DDmaX' | 'Oldschool' | 'Solo' | 'Race' | 'Fun';

export type _MapFinish = {
  timestamp: number;
  map: string;
  time: number;
  country?: string;
  type?: _MapType;
}

export type _Partner = {
  name: string;
  finishes: number;
}

export type _PlayerMapInfo = {
  points: number;
  total_finishes: number;
  finishes: number;
  team_rank?: _Rank;
  rank?: _Rank;
  time?: number;
  first_finish?: number;
}

export type _MapSetInfo = {
  points: _PointsWithTotal;
  team_rank: _Points;
  rank: _Points;
  maps: {
    [map: string]: _PlayerMapInfo;
  };
};

export type _Activity = {
  date: string;
  hours_played: number;
}

export interface _PlayerAPIData {
  player: string;
  points: _PointsWithTotal;
  team_rank: _Points;
  rank: _Points;
  points_last_month: _Points;
  points_last_week: _Points;
  first_finish: _MapFinish;
  last_finishes: _MapFinish[];
  favorite_partners: _Partner[];
  types: {
    [type: string]: _MapSetInfo;
  };
  activity: _Activity[];
  hours_played_past_365_days: number;
};

class PlayerAPIRequest {
  url: string;
  fetched: boolean;
  timestamp: number | null;
  name: string;
  data: _PlayerAPIData | null;
  constructor(name: string) {
    if (typeof name !== 'string') throw new TypeError('"name" must be of type string.');

    this.url = `https://ddnet.tw/players/?json2=${encodeURIComponent(name)}`;
    this.fetched = false;
    this.timestamp = null;
    this.name = name;
    this.data = null;
  }

  async fetch() {
    const DATA: _PlayerAPIData = await (await fetch(this.url)).json() as any;
    if (!DATA || Object.keys(DATA).filter(key => Object.hasOwn(DATA, key)).length === 0) throw new Error(`${this.url} returned no data.`);

    this.data = DATA;
    this.fetched = true;
    this.timestamp = Date.now();

    return this;
  }
}

export default PlayerAPIRequest;