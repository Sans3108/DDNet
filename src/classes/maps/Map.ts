import axios, { AxiosError, AxiosResponse } from 'axios';
import { _MapsJson, _Schema_maps_json } from '../../schemas/maps/json.js';
import { _Schema_maps_query } from '../../schemas/maps/query.js';
import { DDNetError, RankAvailableRegion, Region, Tile, Type, dePythonifyTime, splitMappers, timeString } from '../../util.js';
import { CacheManager } from '../other/CacheManager.js';
import { Finish } from '../other/Finish.js';
import { Player } from '../players/Player.js';
import { Mapper } from './Mapper.js';
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
  //#region Declarations

  /**
   * Raw data for this map.
   */
  #rawData!: _MapsJson; // Marked private with vanilla JS syntax for better logging.

  /**
   * Map responses cache. (24h default TTL)
   */
  private static cache = new CacheManager<object>('map-cache', 24 * 60 * 60 * 1000); // 24h

  /**
   * Sets the TTL (Time-To-Live) for objects in cache.
   */
  public static setTTL = this.cache.setTTL;

  /**
   * Clears the {@link Map.cache}.
   */
  public static clearCache = this.cache.clearCache;

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
  public mappers!: Mapper[];

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
   * The region from which ranks are pulled. `null` for global ranks.
   */
  public rankSource!: RankAvailableRegion | null;

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
    rawData: _MapsJson,
    /**
     * The region to pull ranks from. `null` for global ranks.
     */
    rankSource: RankAvailableRegion | null
  ) {
    this.populate(rawData, rankSource);
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
     * The region to pull ranks from. Omit for global ranks.
     *
     * @remarks
     * Ignored if map url is used instead of map name.
     */
    rankSource?: RankAvailableRegion | null,
    /**
     * Wether to bypass the map data cache.
     */
    bypassCache = false
  ): Promise<Map> {
    const response = await this.makeRequest(nameOrUrl, rankSource, bypassCache);

    if (response instanceof DDNetError) throw response;

    const parsed = this.parseObject(response.data);

    if (!parsed.success) throw parsed.error;

    return new this(parsed.data, rankSource ?? null);
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
     * The region to pull ranks from. Omit for global ranks.
     *
     * @remarks
     * Ignored if map url is used instead of map name.
     */
    rankSource?: RankAvailableRegion | null,
    /**
     * Wether to bypass the cache.
     */
    force = false
  ): Promise<{ data: object; fromCache: boolean } | DDNetError> {
    let url = nameOrUrl.startsWith('https://ddnet.org/maps/') ? nameOrUrl : `https://ddnet.org/maps/?json=${encodeURIComponent(nameOrUrl)}`;

    if (rankSource && nameOrUrl !== url) {
      url += `&country=${rankSource}`;
    }

    if (!force) {
      if (await this.cache.has(url)) {
        const data = await this.cache.get(url);

        if (data) return { data, fromCache: true };
      }
    }

    const response = await axios.get<object | string, AxiosResponse<object | string>>(url).catch((err: AxiosError) => new DDNetError(err.cause?.message, err));

    if (response instanceof DDNetError) return response;

    const data = response.data;

    if (typeof data === 'string') return new DDNetError(`Invalid response!`, data);

    await this.cache.set(url, data);

    return { data, fromCache: false };
  }

  /**
   * Populate the object with the raw map data.
   */
  private populate(
    /**
     * The raw map data.
     */
    rawData: _MapsJson,
    /**
     * The region to pull ranks from. `null` for global ranks.
     */
    rankSource: RankAvailableRegion | null
  ): this {
    this.#rawData = rawData;
    this.rankSource = rankSource;

    this.url = this.#rawData.website;
    if (this.rankSource) {
      this.url = this.url.replace('/maps/', `/maps/${this.rankSource.toLowerCase()}/`);
    }

    this.name = this.#rawData.name;
    this.thumbnailUrl = this.#rawData.thumbnail;
    this.webPreviewUrl = this.#rawData.web_preview;
    this.type = !Object.values<string>(Type).includes(this.#rawData.type) ? Type.unknown : (this.#rawData.type as Type);
    this.points = this.#rawData.points;
    this.difficulty = this.#rawData.difficulty;
    this.mappers = splitMappers(this.#rawData.mapper).map(mapperName => new Mapper({ name: mapperName }));
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
    const data = await Map.makeRequest(this.name, this.rankSource, true);

    if (data instanceof DDNetError) throw new DDNetError(`Failed to refresh ${this}`, data);

    const parsed = Map.parseObject(data.data);

    if (!parsed.success) throw new DDNetError(`Failed to refresh ${this}`, parsed.error);

    return this.populate(parsed.data, this.rankSource);
  }

  /**
   * Returns the name and url of this map in markdown format.
   */
  public toString(): string {
    return `[${this.name}](${this.url})`;
  }

  /**
   * Search for a map.
   */
  public static async search(
    /**
     * The value to search for.
     */
    value: string,
    /**
     * The region to pull ranks from in the `toMap` function from the returned value. Omit for global ranks.
     */
    rankSource?: RankAvailableRegion | null,
    /**
     * Wether to bypass the cache.
     */
    force = false
  ): Promise<{ mappers: { name: string; toMapper: () => Mapper; toPlayer: () => Promise<Player> }[]; type: Type; name: string; toMap: () => Promise<Map> }[] | null> {
    const data = await Map.makeRequest(`https://ddnet.org/maps/?query=${encodeURIComponent(value)}`, null, force);

    if (data instanceof DDNetError) throw data;

    const parsed = _Schema_maps_query.safeParse(data.data);

    if (!parsed.success) throw new DDNetError(`Failed to parse received data.`, parsed.error);

    if (parsed.data.length === 0) return null;

    return parsed.data.map(map => ({
      name: map.name,
      mappers: splitMappers(map.mapper).map(mapperName => ({
        name: mapperName.trim(),
        toMapper: () => new Mapper({ name: mapperName.trim() }),
        toPlayer: async () => await Player.new(mapperName.trim())
      })),
      type: !Object.values<string>(Type).includes(map.type) ? Type.unknown : (map.type as Type),
      toMap: async () => await Map.new(map.name, rankSource)
    }));
  }
}
