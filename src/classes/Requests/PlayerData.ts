import fetch from "node-fetch";
import { z } from "zod";

const Rank_Schema = z.union([z.literal('unranked'), z.number()]);

const Points_Schema = z.object({
  points: z.number().optional(),
  rank: Rank_Schema
});

const PointsWithTotal_Schema = Points_Schema.extend({
  total: z.number()
});

export type PointsWithTotal = z.infer<typeof PointsWithTotal_Schema>;

export { PointsWithTotal_Schema };

const Category_Schema = z.union([z.literal('Novice'), z.literal('Moderate'), z.literal('Brutal'), z.literal('Insane'), z.literal('Dummy'), z.literal('DDmaX'), z.literal('Oldschool'), z.literal('Solo'), z.literal('Race'), z.literal('Fun')]);

export type Category = z.infer<typeof Category_Schema>;

export { Category_Schema };

const MapFinish_Schema = z.object({
  timestamp: z.number(),
  map: z.string(),
  time: z.number(),
  country: z.string().optional(),
  type: z.optional(Category_Schema)
});

export type MapFinish = z.infer<typeof MapFinish_Schema>;

export { MapFinish_Schema };

const Partner_Schema = z.object({
  name: z.string(),
  finishes: z.number()
});

const PlayerMapInfo_Schema = z.object({
  points: z.number(),
  total_finishes: z.number(),
  finishes: z.number(),
  team_rank: Rank_Schema.optional(),
  time: z.number().optional(),
  first_finish: z.number().optional()
});

export type PlayerMapInfo = z.infer<typeof PlayerMapInfo_Schema>;

export { PlayerMapInfo_Schema };

const MapSetInfo_Schema = z.object({
  points: PointsWithTotal_Schema,
  team_rank: Points_Schema,
  rank: Points_Schema,
  maps: z.record(PlayerMapInfo_Schema)
});

const Activity_Schema = z.object({
  date: z.string(),
  hours_played: z.number()
});

const PlayerData_Schema = z.object({
  player: z.string(),
  points: PointsWithTotal_Schema,
  team_rank: Points_Schema,
  rank: Points_Schema,
  points_last_month: Points_Schema,
  points_last_week: Points_Schema,
  first_finish: MapFinish_Schema,
  last_finishes: z.array(MapFinish_Schema),
  favorite_partners: z.array(Partner_Schema),
  types: z.object({
    Novice: MapSetInfo_Schema,
    Moderate: MapSetInfo_Schema,
    Brutal: MapSetInfo_Schema,
    Insane: MapSetInfo_Schema,
    Dummy: MapSetInfo_Schema,
    DDmaX: MapSetInfo_Schema,
    Oldschool: MapSetInfo_Schema,
    Solo: MapSetInfo_Schema,
    Race: MapSetInfo_Schema,
    Fun: MapSetInfo_Schema,
  }),
  activity: z.array(Activity_Schema),
  hours_played_past_365_days: z.number()
});

export type APIPlayerData = z.infer<typeof PlayerData_Schema>;

class PlayerData {
  url: string;
  fetched: boolean;
  readyAt: Date | null;
  name: string;
  data: APIPlayerData | null;
  constructor(name: string) {
    if (typeof name !== 'string') throw new TypeError('"name" must be of type string.');

    this.url = `https://ddnet.tw/players/?json2=${encodeURIComponent(name)}`;
    this.fetched = false;
    this.readyAt = null;
    this.name = name;
    this.data = null;
  }

  async fetch() {
    const DATA: APIPlayerData = await (await fetch(this.url)).json() as any;
    if (!DATA || Object.keys(DATA).filter(key => Object.hasOwn(DATA, key)).length === 0) throw new Error(`${this.url} returned no data.`);
    if (!PlayerData_Schema.safeParse(DATA).success) throw new Error(`Received data does not match schema.`);

    this.data = DATA;
    this.fetched = true;
    this.readyAt = new Date();

    return this;
  }
}

export { PlayerData };