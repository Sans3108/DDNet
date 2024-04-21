import { MapAuthor, MapMaxFinish, MapRank, MapTeamRank } from '@classes';
import { _MapsJson, _Schema_maps_json } from '@schemas';
import { DDNetError, makeRequest, timeString } from '@util';

export class Map {
  readonly #_rawData: _MapsJson;

  public name: string;

  public url: string;

  public thumbnailUrl: string;

  public webPreviewUrl: string;

  public type: string;

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
    this.type = this.#_rawData.type;
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
    this.medianTimeSeconds = this.#_rawData.median_time ?? -1;
    this.medianTimeString = timeString(this.medianTimeSeconds);
    this.firstFinishTimestamp = this.#_rawData.first_finish ?? null;
    this.lastFinishTimestamp = this.#_rawData.last_finish ?? null;
    this.finishCount = this.#_rawData.finishes ?? 0;
    this.finishersCount = this.#_rawData.finishers ?? 0;
  }

  public static async new(name: string): Promise<Map | DDNetError> {
    const response = await makeRequest('maps', 'json', name);

    if (response instanceof DDNetError) return response;

    const parsed = _Schema_maps_json.safeParse(response);

    if (parsed.success) return new Map(parsed.data);

    return new DDNetError(parsed.error.message, parsed.error);
  }
}
