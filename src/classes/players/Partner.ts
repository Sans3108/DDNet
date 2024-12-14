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
   * The url of this player on ddnet.org
   */
  public url: string;

  /**
   * The amount of finishes the player and this partner share.
   */
  public finishCount: number;

  /**
   * Construct a new {@link Partner} instance.
   */
  constructor(data: { name: string; finishCount: number }) {
    this.name = data.name;
    this.url = `https://ddnet.org/players/${encodeURIComponent(this.name)}`;
    this.finishCount = data.finishCount;
  }

  /**
   * Returns a new {@link Player} object from the {@link name} of this partner.
   */
  public async toPlayer(): Promise<Player> {
    return await Player.new(this.name);
  }

  /**
   * Returns the name and url of this player in markdown format.
   */
  public toString(): string {
    return `[${this.name}](${this.url})`;
  }
}
