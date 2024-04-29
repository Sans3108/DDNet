import { slugify } from '../../util.js';
import { Player } from '../players/Player.js';
import { Map } from './Map.js';

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

  // TODO: Author.getMaps
  /**
   * Returns a list of objects holding a map name and
   * a function to turn each of them into a proper {@link Map} object.
   *
   * @throws Not implemented yet.
   */
  public async getMaps(): Promise<Map[]> {
    throw new Error(`<MapAuthor>#getMaps is not implemented.`);
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
