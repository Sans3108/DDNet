import { getLatestFinishes, LatestFinishesFilters, ServerRegion, splitMappers, Tile } from '../../util.js';
import { Map } from '../maps/Map.js';
import { Mapper } from '../maps/Mapper.js';
import { ServerType } from '../players/Servers.js';
import { Finish } from './Finish.js';

/**
 * Represents a map release.
 */
export class Release {
  /**
   * The name of this map.
   */
  public name: string;

  /**
   * The type of this map.
   */
  public type: ServerType;

  /**
   * The url of this map on ddnet.org
   */
  public url: string;

  /**
   * The direct url of this map's thumbnail image.
   */
  public thumbnailUrl: string;

  /**
   * The url to the interactive web preview of this map.
   */
  public webPreviewUrl: string;

  /**
   * Amount of points awarded for completing this map.
   */
  public points: number;

  /**
   * Star difficulty of this map.
   */
  public difficulty: number;

  /**
   * Authors of this map.
   */
  public mappers: Mapper[];

  /**
   * Release timestamp of this map.
   */
  public releasedTimestamp: number | null;

  /**
   * The width of this map.
   */
  public width: number;

  /**
   * The height of this map.
   */
  public height: number;

  /**
   * Array of tiles used in this map.
   */
  public tiles: Tile[];

  /**
   * Construct a new {@link Release} instance.
   */
  constructor(data: { type: string; name: string; website: string; thumbnail: string; web_preview: string; points: number; difficulty: number; mapper: string; releaseTimestamp: number; width: number; height: number; tiles: string[] }) {
    this.name = data.name;
    this.type = !Object.values<string>(ServerType).includes(data.type) ? ServerType.unknown : (data.type as ServerType);
    this.url = data.website;
    this.thumbnailUrl = data.thumbnail;
    this.webPreviewUrl = data.web_preview;
    this.points = data.points;
    this.difficulty = data.difficulty;
    this.mappers = splitMappers(data.mapper).map(mapperName => new Mapper({ name: mapperName.trim() }));
    this.releasedTimestamp = isNaN(data.releaseTimestamp) ? null : data.releaseTimestamp;
    this.width = data.width;
    this.height = data.height;
    this.tiles = data.tiles.map(tile => {
      const values = Object.values<string>(Tile).filter(t => t !== Tile.UNKNOWN_TILE);

      return !values.includes(tile) ? Tile.UNKNOWN_TILE : (tile as Tile);
    });
  }

  /**
   * Returns a new {@link Map} object from the {@link name} of this release.
   */
  public async toMap(
    /**
     * The region to pull ranks from in the `toMap` function from the returned value. Omit for global ranks.
     */
    rankSource?: ServerRegion | null,
    /**
     * Wether to bypass the cache.
     */
    force = false
  ): Promise<Map> {
    return await Map.new(this.name, rankSource, force);
  }

  /**
   * Returns the name and url of this release in markdown format.
   */
  public toString(): string {
    return `[${this.name}](${this.url})`;
  }

  /**
   * Get latest finishes, filtered for this release.
   */
  public async getLatestFinishes(
    /**
     * Filtering options for latest finishes.
     */
    filters?: LatestFinishesFilters
  ): Promise<Finish[]> {
    return await Release.getLatestFinishes(this.name, filters);
  }

  /**
   * Get latest finishes, filtered for a specific release.
   */
  public static async getLatestFinishes(
    /**
     * The name of the map.
     */
    mapName: string,
    /**
     * Filtering options for latest finishes.
     */
    filters?: LatestFinishesFilters
  ): Promise<Finish[]> {
    const finishes = await getLatestFinishes(filters);

    return finishes.filter(f => f.mapName === mapName);
  }
}
