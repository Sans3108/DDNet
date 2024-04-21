import { slugify } from '@util';

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
}
