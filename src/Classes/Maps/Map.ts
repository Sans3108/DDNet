import axios, { AxiosError, AxiosResponse } from 'axios';
import Keyv from 'keyv';
import { _MapsJson, _Schema_maps_json } from '../../schemas/maps/json.js';
import { DDNetError, MapType, dePythonifyTime, timeString } from '../../util.js';
import { MapAuthor } from './MapAuthor.js';
import { MapMaxFinish } from './MapMaxFinish.js';
import { MapRank } from './MapRank.js';
import { MapTeamRank } from './MapTeamRank.js';

/**
 * Class representing a DDNet map.
 */
export class Map {
  //#region Cache

  /**
   * Map responses cache.
   */
  private static cache: Keyv<object> = new Keyv<object>({
    namespace: 'map-cache'
  });

  /**
   * "Time-To-Live" - How much time before a cached object becomes stale, and thus removed automatically.
   */
  private static ttl: number = 2 * 60 * 60 * 1000; // 2 hours

  /**
   * Sets the {@link Map.ttl TTL} for the {@link Map.cache Map responses cache}. Old objects are unaffected.
   * @param timeMS The TTL time in milliseconds.
   */
  public static setTTL(timeMS: number): void {
    this.ttl = timeMS;
  }

  /**
   * Clears the {@link Map.cache Map responses cache}.
   */
  public static async clearCache(): Promise<void> {
    return await this.cache.clear();
  }

  //#endregion

  //#region Declarations
  /**
   * Raw data for this map.
   */
  #rawData!: _MapsJson; // Marked private with vanilla JS syntax for better logging.

  /**
   * The name of this map.
   */
  public name!: string;

  /**
   * The url of this map on ddnet.org
   */
  public url!: string;

  /**
   * The direct url of this map's thumbnail image.
   */
  public thumbnailUrl!: string;

  /**
   * The url to the interactive web preview of this map.
   */
  public webPreviewUrl!: string;

  /**
   * The type of this map.
   */
  public type!: MapType;

  /**
   * Amount of points rewarded for completing this map.
   */
  public points!: number;

  /**
   * Star difficulty of this map.
   */
  public difficulty!: number;

  /**
   * Authors of this map.
   */
  public mappers!: MapAuthor[];

  /**
   * Release timestamp of this map.
   */
  public releasedTimestamp!: number | null;

  /**
   * Biggest team to ever finish this map.
   */
  public biggestTeam!: number;

  /**
   * The width of this map.
   */
  public width!: number;

  /**
   * The height of this map.
   */
  public height!: number;

  /**
   * Array of tiles used in this map.
   */
  public tiles!: string[];

  /**
   * Team ranks for this map.
   */
  public teamRanks!: MapTeamRank[];

  /**
   * Ranks for this map.
   */
  public ranks!: MapRank[];

  /**
   * Top of most amount of finishes on this map.
   */
  public maxFinishes!: MapMaxFinish[];

  /**
   * The average finish time of this map.
   */
  public medianTimeSeconds!: number;

  /**
   * The average finish time of this map in DDNet time format (ex. 23:56)
   */
  public medianTimeString!: string;

  /**
   * Timestamp for the first recorded finish on this map.
   */
  public firstFinishTimestamp!: number | null;

  /**
   * Timestamp for the last recorded finish on this map.
   */
  public lastFinishTimestamp!: number | null;

  /**
   * The total amount of times this map has been finished by any player.
   */
  public finishCount!: number;

  /**
   * The total amount of players that have ever finished this map.
   */
  public finishersCount!: number;
  //#endregion

  /**
   * Create a new instance of {@link Map} from API data.
   * Not intended to be used, use {@link new Map.new} instead.
   * @param rawData The raw data for this map.
   */
  private constructor(rawData: _MapsJson) {
    this.populate(rawData);
  }

  /**
   * Fetch, parse and construct a new {@link Map} instance.
   * @param nameOrUrl The name or url of this map.
   * @param bypassCache Wether to bypass the map data cache.
   */
  public static async new(nameOrUrl: string, bypassCache = false): Promise<Map> {
    const response = await this.makeRequest(nameOrUrl, bypassCache);

    if (response instanceof DDNetError) throw response;

    const parsed = this.parseObject(response.data);

    if (!parsed.success) throw parsed.error;

    return new this(parsed.data);
  }

  /**
   * Parse an object using the map raw data zod schema.
   * @param data The object to be parsed.
   */
  private static parseObject(data: object): { success: true; data: _MapsJson } | { success: false; error: DDNetError } {
    const parsed = _Schema_maps_json.safeParse(data);

    if (parsed.success) return { success: true, data: parsed.data };

    return { success: false, error: new DDNetError(parsed.error.message, parsed.error) };
  }

  /**
   * Fetch the map data from the API.
   * @param nameOrUrl The name or url of the map.
   * @param force Wether to bypass the cache.
   */
  public static async makeRequest(nameOrUrl: string, force = false): Promise<{ data: object; fromCache: boolean } | DDNetError> {
    const url = nameOrUrl.startsWith('https://ddnet.org/maps/') ? nameOrUrl : `https://ddnet.org/maps/?json=${encodeURIComponent(nameOrUrl)}`;

    if (!force) {
      if (await this.cache.has(url)) {
        const data = await this.cache.get(url);

        if (data) return { data, fromCache: true };
      }
    }

    const response = await axios
      .get<object | string, AxiosResponse<object | string>>(url, {
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      .catch((err: AxiosError) => new DDNetError(err.cause?.message, err));

    if (response instanceof DDNetError) return response;

    const data = response.data;

    if (typeof data === 'string') return new DDNetError(`Invalid response!`, data);

    await this.cache.set(url, data, this.ttl);

    return { data, fromCache: false };
  }

  /**
   * Populate the object with the raw map data.
   * @param rawData The raw map data.
   */
  private populate(rawData: _MapsJson): this {
    this.#rawData = rawData;

    this.name = this.#rawData.name;
    this.url = this.#rawData.website;
    this.thumbnailUrl = this.#rawData.thumbnail;
    this.webPreviewUrl = this.#rawData.web_preview;
    this.type = !Object.values<string>(MapType).includes(this.#rawData.type) ? MapType.unknown : (this.#rawData.type as MapType);
    this.points = this.#rawData.points;
    this.difficulty = this.#rawData.difficulty;
    this.mappers = this.#rawData.mapper.split('&').map(mapperName => new MapAuthor({ name: mapperName.trim() }));
    this.releasedTimestamp = this.#rawData.release ? dePythonifyTime(this.#rawData.release) : null;
    this.biggestTeam = this.#rawData.biggest_team;
    this.width = this.#rawData.width;
    this.height = this.#rawData.height;
    this.tiles = this.#rawData.tiles;
    this.teamRanks = this.#rawData.team_ranks.map(rank => new MapTeamRank({ server: rank.country, players: rank.players, rank: rank.rank, timeSeconds: rank.time, timestamp: dePythonifyTime(rank.timestamp) }));
    this.ranks = this.#rawData.ranks.map(rank => new MapRank({ server: rank.country, player: rank.player, rank: rank.rank, timeSeconds: rank.time, timestamp: dePythonifyTime(rank.timestamp) }));
    this.maxFinishes = this.#rawData.max_finishes.map(mf => new MapMaxFinish({ maxTimestamp: dePythonifyTime(mf.max_timestamp), minTimestamp: dePythonifyTime(mf.min_timestamp), count: mf.num, player: mf.player, rank: mf.rank, time: mf.time }));
    this.medianTimeSeconds = this.#rawData.median_time ?? -1;
    this.medianTimeString = timeString(this.medianTimeSeconds);
    this.firstFinishTimestamp = this.#rawData.first_finish ? dePythonifyTime(this.#rawData.first_finish) : null;
    this.lastFinishTimestamp = this.#rawData.last_finish ? dePythonifyTime(this.#rawData.last_finish) : null;
    this.finishCount = this.#rawData.finishes ?? 0;
    this.finishersCount = this.#rawData.finishers ?? 0;

    return this;
  }

  /**
   * Refresh the data for this map.
   */
  public async refresh(): Promise<this> {
    const data = await Map.makeRequest(this.name, true);

    if (data instanceof DDNetError) throw new DDNetError(`Failed to refresh ${this}`, data);

    const parsed = Map.parseObject(data.data);

    if (!parsed.success) throw new DDNetError(`Failed to refresh ${this}`, parsed.error);

    return this.populate(parsed.data);
  }

  public toString(): string {
    return this.name;
  }
}
