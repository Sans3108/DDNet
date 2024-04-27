import { slugify } from '../../util.js';
import { Player } from '../players/Player.js';

/**
 * Class representing a map author.
 */
export class MapAuthor {
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

  constructor(data: { name: string }) {
    this.name = data.name;
    this.mapShowcaseUrl = `https://ddnet.org/mappers/${slugify(this.name)}`;
    this.playerUrl = `https://ddnet.org/players/${encodeURIComponent(this.name)}`;
  }

  // TODO: MapAuthor.getMaps
  public async getMaps(): Promise<void> {
    console.log(`<MapAuthor>#getMaps is not implemented.`);
  }

  /**
   * Returns a new {@link Player} object from this author.
   */
  public async toPlayer(): Promise<Player> {
    return await Player.new(this.name);
  }

  public toString(): string {
    return this.name;
  }
}
