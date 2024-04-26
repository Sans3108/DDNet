import { slugify } from '../../util.js';
import { Player } from '../Players/Player.js';

export class MapAuthor {
  public name: string;
  public url: string;

  constructor(data: { name: string }) {
    this.name = data.name;
    this.url = `https://ddnet.org/mappers/${slugify(this.name)}`;
  }

  public async getMaps(): Promise<void> {
    throw new Error('Not implemented.');
  }

  public toString(): string {
    return this.name;
  }

  public async toPlayer(): Promise<Player> {
    return await Player.new(this.name);
  }
}
