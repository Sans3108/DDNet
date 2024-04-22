import { Player } from '@classes';
import { DDNetError, slugify } from '@util';

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

  public async toPlayer(): Promise<{ success: true; instance: Player } | { success: false; error: DDNetError }> {
    return await Player.new(this.name);
  }
}
