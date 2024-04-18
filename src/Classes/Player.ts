import { _PlayersJson2, _Schema_players_json2 } from '../Schemas/index.js';
import { DDNetError, makeRequest } from '../util.js';

/**
 * Class representing a DDNet player.
 */
class Player {
  private readonly rawData: _PlayersJson2;

  /**
   * The name of this player.
   */
  public name: string;

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
    this.rawData = rawData;

    this.name = this.rawData.player;
    this.points = this.rawData.points.rank ? this.rawData.points.points : 0;
    this.globalRank = this.rawData.points.rank;
    this.maxEarnablePoints = this.rawData.points.total;
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
