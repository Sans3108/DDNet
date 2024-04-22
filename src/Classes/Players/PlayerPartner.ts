import { Player } from '@classes';
import { DDNetError } from '@util';

export class PlayerPartner {
  public name: string;
  public finishes: number;

  constructor(data: { name: string; finishes: number }) {
    this.name = data.name;
    this.finishes = data.finishes;
  }

  public async toPlayer(): Promise<{ success: true; instance: Player } | { success: false; error: DDNetError }> {
    return await Player.new(this.name);
  }
}
