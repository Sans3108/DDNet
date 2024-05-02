import axios, { AxiosError, AxiosResponse } from 'axios';
import { _Schema_maps_qmapper } from '../../schemas/maps/qmapper.js';
import { DDNetError, Type, slugify } from '../../util.js';
import { CacheManager } from '../other/CacheManager.js';
import { Release } from '../other/Release.js';
import { Releases } from '../other/Releases.js';
import { Player } from '../players/Player.js';

/**
 * Represents a map author/mapper.
 */
export class Mapper {
  /**
   * Mapper query responses cache. (2h default TTL)
   */
  private static cache = new CacheManager<object>('qmapper-cache');

  /**
   * Sets the TTL (Time-To-Live) for objects in cache.
   */
  public static setTTL = this.cache.setTTL;

  /**
   * Clears the {@link Player.cache}.
   */
  public static clearCache = this.cache.clearCache;

  /**
   * The name of this author.
   */
  public name: string;

  /**
   * The ddnet.org url to this author's map showcase page.
   */
  public mapShowcaseUrl: string;

  /**
   * The ddnet.org url to this author's player page.
   */
  public playerUrl: string;

  /**
   * Construct a new {@link Mapper} instance.
   */
  constructor(data: { name: string }) {
    this.name = data.name;
    this.mapShowcaseUrl = `https://ddnet.org/mappers/${slugify(this.name)}`;
    this.playerUrl = `https://ddnet.org/players/${encodeURIComponent(this.name)}`;
  }

  /**
   * Returns an array of releases by this author.
   */
  public async getMaps(
    /**
     * If provided, the method will return only releases of this type.
     */
    type?: Type
  ): Promise<Release[]> {
    const releases = await Releases.new();

    const maps = releases.maps.filter(r => r.mappers.map(a => a.name).includes(this.name));

    if (type) {
      return maps.filter(m => m.type === type);
    }

    return maps;
  }

  /**
   * Returns a new {@link Player} object from this author.
   */
  public async toPlayer(): Promise<Player> {
    return await Player.new(this.name);
  }

  /**
   * Returns the name and mapShowcaseUrl of this Author in markdown format.
   */
  public toString(): string {
    return `[${this.name}](${this.mapShowcaseUrl})`;
  }

  /**
   * Search for a mapper.
   */
  public static async search(
    /**
     * The value to search for.
     */
    value: string,
    /**
     * Wether to bypass the cache.
     */
    force = false
  ): Promise<{ name: string; mapCount: number; toPlayer: () => Promise<Player>; toMapper: () => Mapper }[] | null> {
    const url = `https://ddnet.org/maps/?qmapper=${encodeURIComponent(value)}`;

    const parse = (data: object) => {
      const parsed = _Schema_maps_qmapper.safeParse(data);

      if (!parsed.success) throw new DDNetError(`Failed to parse data.`, parsed.error);

      return parsed.data;
    };

    if (!force) {
      if (await this.cache.has(url)) {
        const data = await this.cache.get(url);

        if (data) {
          const parsed = parse(data);

          return parsed.map(mapper => ({
            name: mapper.mapper,
            mapCount: mapper.num_maps,
            toPlayer: async () => await Player.new(mapper.mapper),
            toMapper: () => new Mapper({ name: mapper.mapper })
          }));
        }
      }
    }

    const response = await axios
      .get<object | string, AxiosResponse<object | string>>(url, {
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      .catch((err: AxiosError) => new DDNetError(err.cause?.message, err));

    if (response instanceof DDNetError) throw response;

    const data = response.data;

    if (typeof data === 'string') throw new DDNetError(`Invalid response!`, data);

    await this.cache.set(url, data);

    const parsed = parse(data);

    return parsed.map(mapper => ({
      name: mapper.mapper,
      mapCount: mapper.num_maps,
      toPlayer: async () => await Player.new(mapper.mapper),
      toMapper: () => new Mapper({ name: mapper.mapper })
    }));
  }
}
