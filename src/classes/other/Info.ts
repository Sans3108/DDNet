import axios, { AxiosError, AxiosResponse } from 'axios';
import { _Info, _Schema_info } from '../../schemas/other/info.js';
import { DDNetError } from '../../util.js';
import { CacheManager } from './CacheManager.js';
import { Community } from './Community.js';

/**
 * Represents servers info.
 */
export class Info {
  //#region Cache

  /**
   * Info responses cache.
   */
  private static cache = new CacheManager<object>('info-cache', 12 * 60 * 60 * 1000); // 12h ttl

  /**
   * Sets the TTL (Time-To-Live) for objects in cache.
   */
  public static setTTL = this.cache.setTTL;

  /**
   * Clears the {@link Info.cache}.
   */
  public static clearCache = this.cache.clearCache;

  //#endregion

  //#region Declarations

  /**
   * Raw info data.
   */
  #rawData!: _Info; // Marked private with vanilla JS syntax for better logging.

  /**
   * List of major communities.
   */
  public communities!: Community[];

  /**
   * Community icons directory.
   */
  public communityIconsDownloadUrl!: string;

  /**
   * Game news.
   */
  public news!: string;

  /**
   * Maps directory.
   */
  public mapDownloadUrl!: string;

  /**
   * Latest game version.
   */
  public version!: string;

  /**
   * Other parsed data.
   *
   * @remarks
   * I think this is mostly used in the client. Still I parsed the data and added it here.
   */
  public other!: {
    location: string;
    stunServersIpv6: string[];
    stunServersIpv4: string[];
    warnPngliteIncompatibleImages: boolean;
  };

  //#endregion

  /**
   * Create a new instance of {@link Info} from API data.
   * Not intended to be used, use {@link new Info.new} instead.
   */
  private constructor(
    /**
     * The raw info data.
     */
    rawData: _Info
  ) {
    this.populate(rawData);
  }

  /**
   * Fetch, parse and construct a new {@link Info} instance.
   */
  public static async new(
    /**
     * Wether to bypass the info data cache.
     */
    bypassCache = false
  ): Promise<Info> {
    const response = await this.makeRequest(bypassCache);

    if (response instanceof DDNetError) throw response;

    const parsed = this.parseObject(response.data);

    if (!parsed.success) throw parsed.error;

    return new this(parsed.data);
  }

  /**
   * Parse an object using the {@link _Schema_info raw data zod schema}.
   */
  private static parseObject(
    /**
     * The object to be parsed.
     */
    data: object
  ): { success: true; data: _Info } | { success: false; error: DDNetError } {
    const parsed = _Schema_info.safeParse(data);

    if (parsed.success) return { success: true, data: parsed.data };

    return { success: false, error: new DDNetError(parsed.error.message, parsed.error) };
  }

  /**
   * Fetch the info data from the API.
   */
  private static async makeRequest(
    /**
     * Wether to bypass the cache.
     */
    force = false
  ): Promise<{ data: object; fromCache: boolean } | DDNetError> {
    const url = 'https://info.ddnet.org/info';

    if (!force) {
      if (await this.cache.has(url)) {
        const data = await this.cache.get(url);

        if (data) return { data, fromCache: true };
      }
    }

    const response = await axios
      .get<object | string, AxiosResponse<object | string>>(url)
      .catch((err: AxiosError) => new DDNetError(err.cause?.message, err));

    if (response instanceof DDNetError) return response;

    const data = response.data;

    if (typeof data === 'string') return new DDNetError(`Invalid response!`, data);

    await this.cache.set(url, data);

    return { data, fromCache: false };
  }

  /**
   * Populate the object with the raw info data.
   */
  private populate(
    /**
     * The raw info data.
     */
    rawData: _Info
  ): this {
    this.#rawData = rawData;

    this.communities = this.#rawData.communities.map(c => {
      if (c.id === 'ddnet' || c.id === 'kog') {
        c.icon.servers = c.id === 'ddnet' ? this.#rawData.servers : this.#rawData['servers-kog'];
      }

      return new Community(c as unknown as ConstructorParameters<typeof Community>[0]);
    });

    this.communityIconsDownloadUrl = this.#rawData['community-icons-download-url'];

    this.news = this.#rawData.news;

    this.mapDownloadUrl = this.#rawData['map-download-url'];

    this.version = this.#rawData.version;

    this.other = {
      location: this.#rawData.location,
      stunServersIpv6: this.#rawData['stun-servers-ipv6'],
      stunServersIpv4: this.#rawData['stun-servers-ipv4'],
      warnPngliteIncompatibleImages: this.#rawData['warn-pnglite-incompatible-images']
    };

    return this;
  }

  /**
   * Refresh the info data.
   */
  public async refresh(): Promise<this> {
    const data = await Info.makeRequest(true);

    if (data instanceof DDNetError) throw new DDNetError(`Failed to refresh info`, data);

    const parsed = Info.parseObject(data.data);

    if (!parsed.success) throw new DDNetError(`Failed to refresh info`, parsed.error);

    return this.populate(parsed.data);
  }

  /**
   * Get all server addresses from all communities.
   */
  public getAllServerAddresses(): string[] {
    return this.communities.flatMap(c => c.getAllServerAddresses());
  }
}
