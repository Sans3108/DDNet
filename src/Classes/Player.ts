import { _PlayersJson2, _Schema_players_json2 } from '../Schemas/index.js';
import { DDNetError, makeRequest } from '../util.js';

/**
 * Class representing a DDNet player.
 */
export class Player {
  readonly #_rawData: _PlayersJson2;

  /**
   * The name of this player.
   */
  public name: string;

  /**
   * The url of this player on ddnet.org
   */
  public url: string;

  /**
   * The amount of points this player has earned.
   */
  public points: number;

  /**
   * The global rank of this player, `null` if unranked.
   */
  public globalRank: number | null;

  /**
   * The maximum earnable points from all DDNet maps.
   */
  public maxEarnablePoints: number;

  /**
   * The amount of points left to be earned by this player out of {@link maxEarnablePoints}.
   */
  public earnablePoints: number;

  /**
   * Create a new instance of {@link Player} from API data.
   */
  public constructor(rawData: _PlayersJson2) {
    this.#_rawData = rawData;

    this.name = this.#_rawData.player;
    this.url = `https://ddnet.org/players/${encodeURIComponent(this.name)}`;
    this.points = this.#_rawData.points.rank ? this.#_rawData.points.points : 0;
    this.globalRank = this.#_rawData.points.rank;
    this.maxEarnablePoints = this.#_rawData.points.total;
    this.earnablePoints = this.maxEarnablePoints - this.points;
  }

  /**
   * Fetch, parse and construct a new {@link Player} instance.
   * @param name The name of this player.
   */
  static async new(name: string): Promise<Player | DDNetError> {
    const response = await makeRequest('players', 'json2', name);

    if (response instanceof DDNetError) return response;

    const parsed = _Schema_players_json2.safeParse(response);

    if (parsed.success) return new Player(parsed.data);

    return new DDNetError(parsed.error.message, parsed.error);
  }
}
