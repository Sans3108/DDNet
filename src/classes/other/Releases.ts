import axios, { AxiosError, AxiosResponse } from 'axios';
import { _Releases, _Schema_releases } from '../../schemas/other/releases.js';
import { DDNetError, Type, dePythonifyTime } from '../../util.js';
import { CacheManager } from './CacheManager.js';
import { Release } from './Release.js';

/**
 * Represents DDNet map releases.
 */
export class Releases {
  //#region Cache

  /**
   * Releases responses cache.
   */
  private static cache = new CacheManager<object>('releases-cache', 8 * 60 * 60 * 1000); // 8h ttl

  /**
   * Sets the TTL (Time-To-Live) for objects in cache.
   */
  public static setTTL = this.cache.setTTL;

  /**
   * Clears the {@link Releases.cache}.
   */
  public static clearCache = this.cache.clearCache;

  //#endregion

  //#region Declarations

  /**
   * Raw releases data.
   */
  #rawData!: _Releases; // Marked private with vanilla JS syntax for better logging.

  /**
   * Array with all the map releases.
   */
  public maps!: Release[];

  //#endregion

  /**
   * Create a new instance of {@link Releases} from API data.
   * Not intended to be used, use {@link new Releases.new} instead.
   */
  private constructor(
    /**
     * The raw data for this map.
     */
    rawData: _Releases
  ) {
    this.populate(rawData);
  }

  /**
   * Fetch, parse and construct a new {@link Releases} instance.
   */
  public static async new(
    /**
     * Wether to bypass the releases data cache.
     */
    bypassCache = false
  ): Promise<Releases> {
    const response = await this.makeRequest(bypassCache);

    if (response instanceof DDNetError) throw response;

    const parsed = this.parseObject(response.data);

    if (!parsed.success) throw parsed.error;

    return new this(parsed.data);
  }

  /**
   * Parse an object using the {@link _Schema_releases releases raw data zod schema}.
   */
  private static parseObject(
    /**
     * The object to be parsed.
     */
    data: object
  ): { success: true; data: _Releases } | { success: false; error: DDNetError } {
    const parsed = _Schema_releases.safeParse(data);

    if (parsed.success) return { success: true, data: parsed.data };

    return { success: false, error: new DDNetError(parsed.error.message, parsed.error) };
  }

  /**
   * Fetch the releases data from the API.
   */
  private static async makeRequest(
    /**
     * Wether to bypass the cache.
     */
    force = false
  ): Promise<{ data: object; fromCache: boolean } | DDNetError> {
    const url = 'https://ddnet.org/releases/maps.json';

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
   * Populate the object with the raw releases data.
   */
  private populate(
    /**
     * The raw releases data.
     */
    rawData: _Releases
  ): this {
    this.#rawData = rawData;

    this.maps = this.#rawData.map(
      r =>
        new Release({
          name: r.name,
          type: r.type,
          releaseTimestamp: dePythonifyTime(r.release),
          width: r.width,
          height: r.height,
          tiles: r.tiles,
          difficulty: r.difficulty,
          points: r.points,
          mapper: r.mapper,
          thumbnail: r.thumbnail,
          web_preview: r.web_preview,
          website: r.website
        })
    );

    return this;
  }

  /**
   * Refresh the releases data.
   */
  public async refresh(): Promise<this> {
    const data = await Releases.makeRequest(true);

    if (data instanceof DDNetError) throw new DDNetError(`Failed to refresh releases`, data);

    const parsed = Releases.parseObject(data.data);

    if (!parsed.success) throw new DDNetError(`Failed to refresh releases`, parsed.error);

    return this.populate(parsed.data);
  }

  /**
   * Get all the releases of a specific {@link Type}.
   */
  public getServer(
    /**
     * The type of the releases.
     */
    type: Type
  ): Release[] {
    return this.maps.filter(m => m.type === (type as Type));
  }
}
