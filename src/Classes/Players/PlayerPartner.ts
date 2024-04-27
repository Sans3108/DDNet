import { Player } from './Player.js';

/**
 * Class representing a player's partner.
 */
export class PlayerPartner {
  /**
   * The name of this partner.
   */
  public name: string;

  /**
   * The amount of finished the player and this partner share.
   */
  public finishes: number;

  constructor(data: { name: string; finishes: number }) {
    this.name = data.name;
    this.finishes = data.finishes;
  }

  /**
   * Returns a new {@link Player} object from this partner.
   */
  public async toPlayer(): Promise<Player> {
    return await Player.new(this.name);
  }
}
