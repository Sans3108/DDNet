import axios, { AxiosError, AxiosResponse } from 'axios';
import Keyv from 'keyv';
import { _MapsJson, _Schema_maps_json } from '../../schemas/maps/json.js';
import { DDNetError, Region, Tile, Type, dePythonifyTime, timeString } from '../../util.js';
import { Finish } from '../other/Finish.js';
import { Author } from './Author.js';
import { MaxFinish } from './MaxFinish.js';

/**
 * Represents a DDNet map.
 *
 * @example
 * ```ts
 * const myFavMap = await Map.new('Kobra 4');
 *
 * console.log(myFavMap.webPreviewUrl); // "https://ddnet.org/mappreview/?map=Kobra+4"
 * console.log(myFavMap.difficulty); // 4
 * console.log(myFavMap.maxFinishes[0]);
 * // MapMaxFinish {
 * //   rank: 1,
 * //   player: 'nameless tee',
 * //   count: 659,
 * //   timeSeconds: 1754617.6977539062,
 * //   timeString: '487:23:37',
 * //   minTimestamp: 1438545584000,
 * //   maxTimestamp: 1714287869000
 * // }
 * ```
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
   * "Time-To-Live" - How much time (in milliseconds) before a cached object becomes stale, and thus removed automatically.
   *
   * Changing this value does not affect old objects.
   *
   * @default 7200000 // 2 hours
   */
  public static ttl: number = 2 * 60 * 60 * 1000; // 2h

  /**
   * Clears the {@link Map.cache}.
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
  public type!: Type;

  /**
   * Amount of points awarded for completing this map.
   */
  public points!: number;

  /**
   * Star difficulty of this map.
   */
  public difficulty!: number;

  /**
   * Authors of this map.
   */
  public mappers!: Author[];

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
  public tiles!: Tile[];

  /**
   * Team finishes for this map.
   */
  public teamFinishes!: Finish[];

  /**
   * Ranks for this map.
   */
  public finishes!: Finish[];

  /**
   * Top of most amount of finishes on this map.
   */
  public maxFinishes!: MaxFinish[];

  /**
   * The average finish time of this map in seconds.
   */
  public medianTimeSeconds!: number;

  /**
   * String formatted average finish time.
   *
   * @example "03:23"
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
   */
  private constructor(
    /**
     * The raw data for this map.
     */
    rawData: _MapsJson
  ) {
    this.populate(rawData);
  }

  /**
   * Fetch, parse and construct a new {@link Map} instance.
   */
  public static async new(
    /**
     * The name or ddnet.org url of this map.
     */
    nameOrUrl: string,
    /**
     * Wether to bypass the map data cache.
     */
    bypassCache = false
  ): Promise<Map> {
    const response = await this.makeRequest(nameOrUrl, bypassCache);

    if (response instanceof DDNetError) throw response;

    const parsed = this.parseObject(response.data);

    if (!parsed.success) throw parsed.error;

    return new this(parsed.data);
  }

  /**
   * Parse an object using the {@link _Schema_maps_json map raw data zod schema}.
   */
  private static parseObject(
    /**
     * The object to be parsed.
     */
    data: object
  ): { success: true; data: _MapsJson } | { success: false; error: DDNetError } {
    const parsed = _Schema_maps_json.safeParse(data);

    if (parsed.success) return { success: true, data: parsed.data };

    return { success: false, error: new DDNetError(parsed.error.message, parsed.error) };
  }

  /**
   * Fetch the map data from the API.
   */
  private static async makeRequest(
    /**
     * The name or url of the map.
     */
    nameOrUrl: string,
    /**
     * Wether to bypass the cache.
     */
    force = false
  ): Promise<{ data: object; fromCache: boolean } | DDNetError> {
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
   */
  private populate(
    /**
     * The raw map data.
     */
    rawData: _MapsJson
  ): this {
    this.#rawData = rawData;

    this.name = this.#rawData.name;
    this.url = this.#rawData.website;
    this.thumbnailUrl = this.#rawData.thumbnail;
    this.webPreviewUrl = this.#rawData.web_preview;
    this.type = !Object.values<string>(Type).includes(this.#rawData.type) ? Type.unknown : (this.#rawData.type as Type);
    this.points = this.#rawData.points;
    this.difficulty = this.#rawData.difficulty;
    this.mappers = this.#rawData.mapper.split('&').map(mapperName => new Author({ name: mapperName.trim() }));
    this.releasedTimestamp = this.#rawData.release ? dePythonifyTime(this.#rawData.release) : null;
    this.biggestTeam = this.#rawData.biggest_team;
    this.width = this.#rawData.width;
    this.height = this.#rawData.height;
    this.tiles = this.#rawData.tiles.map(tile => {
      const values = Object.values<string>(Tile).filter(t => t !== Tile.UNKNOWN_TILE);

      return !values.includes(tile) ? Tile.UNKNOWN_TILE : (tile as Tile);
    });

    this.teamFinishes = this.#rawData.team_ranks.map(
      rank =>
        new Finish({
          region: !Object.values<string>(Region).includes(rank.country) ? Region.UNK : (rank.country as Region),
          mapName: this.name,
          players: rank.players,
          rank: {
            placement: rank.rank,
            points: this.points
          },
          timeSeconds: rank.time,
          timestamp: dePythonifyTime(rank.timestamp)
        })
    );

    this.finishes = this.#rawData.ranks.map(
      rank =>
        new Finish({
          region: !Object.values<string>(Region).includes(rank.country) ? Region.UNK : (rank.country as Region),
          mapName: this.name,
          players: [rank.player],
          rank: {
            placement: rank.rank,
            points: this.points
          },
          timeSeconds: rank.time,
          timestamp: dePythonifyTime(rank.timestamp)
        })
    );

    this.maxFinishes = this.#rawData.max_finishes.map(mf => new MaxFinish({ maxTimestamp: dePythonifyTime(mf.max_timestamp), minTimestamp: dePythonifyTime(mf.min_timestamp), count: mf.num, player: mf.player, rank: mf.rank, time: mf.time }));
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

  /**
   * Returns the name and url of this map in markdown format.
   */
  public toString(): string {
    return `[${this.name}](${this.url})`;
  }
}
