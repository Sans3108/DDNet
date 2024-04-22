import { MapAuthor, MapMaxFinish, MapRank, MapTeamRank } from '@classes';
import { _MapsJson, _Schema_maps_json } from '@schemas';
import { DDNetError, makeRequest, timeString } from '@util';

export enum MapType {
  novice = 'Novice',
  moderate = 'Moderate',
  brutal = 'Brutal',
  insane = 'Insane',
  dummy = 'Dummy',
  ddmaxEasy = 'DDmaX.Easy',
  ddmaxNext = 'DDmaX.Next',
  ddmaxPro = 'DDmaX.Pro',
  ddmaxNut = 'DDmaX.Nut',
  oldschool = 'Oldschool',
  solo = 'Solo',
  race = 'Race',
  fun = 'Fun',
  unknown = 'UNKNOWN'
}

export class Map {
  readonly #_rawData: _MapsJson;

  public name: string;

  public url: string;

  public thumbnailUrl: string;

  public webPreviewUrl: string;

  public type: MapType;

  public points: number;

  public difficulty: number;

  public mappers: MapAuthor[];

  public releasedTimestamp: number | null;

  public biggestTeam: number;

  public width: number;

  public height: number;

  public tiles: string[];

  public teamRanks: MapTeamRank[];

  public ranks: MapRank[];

  public maxFinishes: MapMaxFinish[];

  public medianTimeSeconds: number;

  public medianTimeString: string;

  public firstFinishTimestamp: number | null;

  public lastFinishTimestamp: number | null;

  public finishCount: number;

  public finishersCount: number;

  public constructor(rawData: _MapsJson) {
    this.#_rawData = rawData;

    this.name = this.#_rawData.name;
    this.url = this.#_rawData.website;
    this.thumbnailUrl = this.#_rawData.thumbnail;
    this.webPreviewUrl = this.#_rawData.web_preview;
    this.type = !Object.values<string>(MapType).includes(this.#_rawData.type) ? MapType.unknown : (this.#_rawData.type as MapType);
    this.points = this.#_rawData.points;
    this.difficulty = this.#_rawData.difficulty;
    this.mappers = this.#_rawData.mapper.split('&').map(mapperName => new MapAuthor({ name: mapperName.trim() }));
    this.releasedTimestamp = this.#_rawData.release ?? null;
    this.biggestTeam = this.#_rawData.biggest_team;
    this.width = this.#_rawData.width;
    this.height = this.#_rawData.height;
    this.tiles = this.#_rawData.tiles;
    this.teamRanks = this.#_rawData.team_ranks.map(rank => new MapTeamRank({ country: rank.country, players: rank.players, rank: rank.rank, timeSeconds: rank.time, timestamp: rank.timestamp }));
    this.ranks = this.#_rawData.ranks.map(rank => new MapRank({ country: rank.country, player: rank.player, rank: rank.rank, timeSeconds: rank.time, timestamp: rank.timestamp }));
    this.maxFinishes = this.#_rawData.max_finishes.map(mf => new MapMaxFinish({ maxTimestamp: mf.max_timestamp, minTimestamp: mf.min_timestamp, count: mf.num, player: mf.player, rank: mf.rank, time: mf.time }));

    console.log(this.#_rawData.max_finishes[0]);

    this.medianTimeSeconds = this.#_rawData.median_time ?? -1;
    this.medianTimeString = timeString(this.medianTimeSeconds);
    this.firstFinishTimestamp = this.#_rawData.first_finish ?? null;
    this.lastFinishTimestamp = this.#_rawData.last_finish ?? null;
    this.finishCount = this.#_rawData.finishes ?? 0;
    this.finishersCount = this.#_rawData.finishers ?? 0;
  }

  public static async new(name: string): Promise<{ success: true; instance: Map } | { success: false; error: DDNetError }> {
    const response = await makeRequest('maps', 'json', name);

    if (response instanceof DDNetError) return { success: false, error: response };

    const parsed = _Schema_maps_json.safeParse(response);

    if (parsed.success) return { success: true, instance: new Map(parsed.data) };

    return { success: false, error: new DDNetError(parsed.error.message, parsed.error) };
  }

  public toString(): string {
    return this.name;
  }
}
