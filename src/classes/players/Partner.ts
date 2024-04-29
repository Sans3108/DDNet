import { Player } from './Player.js';

/**
 * Represents a player's partner.
 */
export class Partner {
  /**
   * The name of this partner.
   */
  public name: string;

  /**
   * The amount of finishes the player and this partner share.
   */
  public finishes: number;

  /**
   * Construct a new {@link Partner} instance.
   */
  constructor(data: { name: string; finishes: number }) {
    this.name = data.name;
    this.finishes = data.finishes;
  }

  /**
   * Returns a new {@link Player} object from the {@link name} of this partner.
   */
  public async toPlayer(): Promise<Player> {
    return await Player.new(this.name);
  }
}
