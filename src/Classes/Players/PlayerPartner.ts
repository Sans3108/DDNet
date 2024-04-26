import { Player } from './Player.js';

export class PlayerPartner {
  public name: string;
  public finishes: number;

  constructor(data: { name: string; finishes: number }) {
    this.name = data.name;
    this.finishes = data.finishes;
  }

  public async toPlayer(): Promise<Player> {
    return await Player.new(this.name);
  }
}
