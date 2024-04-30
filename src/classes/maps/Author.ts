import { Type, slugify } from '../../util.js';
import { Release } from '../other/Release.js';
import { Releases } from '../other/Releases.js';
import { Player } from '../players/Player.js';

/**
 * Represents a map author.
 */
export class Author {
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
   * Construct a new {@link Author} instance.
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
}
