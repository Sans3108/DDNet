import axios, { AxiosError, AxiosResponse } from 'axios';
import Keyv from 'keyv';
import { _PlayersJson2, _Schema_players_json2 } from '../../schemas/players/json2.js';
import { DDNetError, MapType, ServerRegion, dePythonifyTime } from '../../util.js';
import { Activity } from './Activity.js';
import { Finish } from './Finish.js';
import { Finishes } from './Finishes.js';
import { GlobalLeaderboard } from './GlobalLeaderboard.js';
import { Leaderboard } from './Leaderboard.js';
import { CompletedMapStats, UncompletedMapStats } from './MapStats.js';
import { Partner } from './Partner.js';
import { RecentFinish } from './RecentFinish.js';
import { ServerStats } from './ServerStats.js';
import { Servers } from './Servers.js';

/**
 * Class representing a DDNet player.
 * @example
 * ```ts
 * const coolGuy = await Player.new('Sans3108');
 *
 * console.log(coolGuy.favoriteServer); // "GER"
 * console.log(coolGuy.globalLeaderboard.completionist.points); // 2727
 * ```
 */
export class Player {
  //#region Cache

  /**
   * Player responses cache.
   */
  private static cache: Keyv<object> = new Keyv<object>({
    namespace: 'player-cache'
  });

  /**
   * "Time-To-Live" - How much time (in milliseconds) before a cached object becomes stale, and thus removed automatically.
   *
   * Changing this value does not affect old objects.
   *
   * @default 7200000 // 2 hours
   */
  public static ttl: number = 2 * 60 * 60 * 1000; // 2h

  /**
   * Clears the {@link Player.cache}.
   */
  public static async clearCache(): Promise<void> {
    return await this.cache.clear();
  }

  //#endregion

  //#region Declarations

  /**
   * Raw data for this player.
   */
  #rawData!: _PlayersJson2; // Marked private with vanilla JS syntax for better logging.

  /**
   * The name of this player.
   */
  public name!: string;

  /**
   * The url of this player on ddnet.org
   */
  public url!: string;

  /**
   * Global leaderboard stats for this player.
   */
  public globalLeaderboard!: GlobalLeaderboard;

  /**
   * Total amount of points earnable from first completions across all maps.
   */
  public totalCompletionistPoints!: number;

  /**
   * The favorite server region of this player.
   */
  public favoriteServer!: ServerRegion;

  /**
   * First and recent finishes for this player.
   */
  public finishes!: Finishes;

  /**
   * Favorite partners of this player.
   */
  public favoritePartners!: Partner[];

  /**
   * Server stats leaderboards for this player.
   */
  public serverTypes!: Servers;

  /**
   * Daily player activity.
   */
  public activity!: Activity[];

  /**
   * Number of hours played in the past 365 days by this player.
   */
  public hoursPlayedPast365days!: number;

  //#endregion

  /**
   * Create a new instance of {@link Player} from API data.
   * Not intended to be used, use {@link new Player.new} instead.
   */
  private constructor(
    /**
     * The raw data for this player.
     */
    rawData: _PlayersJson2
  ) {
    this.populate(rawData);
  }

  /**
   * Fetch, parse and construct a new {@link Player} instance.
   */
  public static async new(
    /**
     * The name or ddnet.org url of this player.
     */
    nameOrUrl: string,
    /**
     * Wether to bypass the player data cache.
     */
    bypassCache = false
  ): Promise<Player> {
    const response = await this.makeRequest(nameOrUrl, bypassCache);

    if (response instanceof DDNetError) throw response;

    const parsed = this.parseObject(response.data);

    if (!parsed.success) throw parsed.error;

    return new this(parsed.data);
  }

  /**
   * Parse an object using the player raw data zod schema.
   */
  private static parseObject(
    /**
     * The object to be parsed.
     */
    data: object
  ): { success: true; data: _PlayersJson2 } | { success: false; error: DDNetError } {
    const parsed = _Schema_players_json2.safeParse(data);

    if (parsed.success) return { success: true, data: parsed.data };

    return { success: false, error: new DDNetError(parsed.error.message, parsed.error) };
  }

  /**
   * Fetch the player data from the API.
   */
  private static async makeRequest(
    /**
     * The name or ddnet.org url of the player.
     */
    nameOrUrl: string,
    /**
     * Wether to bypass the cache.
     */
    force = false
  ): Promise<{ data: object; fromCache: boolean } | DDNetError> {
    const url = nameOrUrl.startsWith('https://ddnet.org/players/') ? nameOrUrl : `https://ddnet.org/players/?json2=${encodeURIComponent(nameOrUrl)}`;

    if (!force) {
      if (await this.cache.has(url)) {
        const data = await this.cache.get(url);

        if (data) return { data, fromCache: true };
      }
    }

    const response = await axios
      .get<object | string, AxiosResponse<object | string>>(url, {
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      .catch((err: AxiosError) => new DDNetError(err.cause?.message, err));

    if (response instanceof DDNetError) return response;

    const data = response.data;

    if (typeof data === 'string') return new DDNetError(`Invalid response!`, data);

    await this.cache.set(url, data, this.ttl);

    return { data, fromCache: false };
  }

  /**
   * Populate the object with the raw player data.
   */
  private populate(
    /**
     * The raw player data.
     */
    rawData: _PlayersJson2
  ): this {
    this.#rawData = rawData;

    this.name = this.#rawData.player;
    this.url = `https://ddnet.org/players/${encodeURIComponent(this.name)}`;

    if (!this.#rawData.points.rank) throw new DDNetError('Player points assumption turned out to be null.');

    this.globalLeaderboard = new GlobalLeaderboard({
      completionist: {
        placement: this.#rawData.points.rank,
        points: this.#rawData.points.points
      },
      completionistLastMonth:
        'points' in this.#rawData.points_last_month ?
          {
            placement: this.#rawData.points_last_month.rank,
            points: this.#rawData.points_last_month.points
          }
        : null,
      completionistLastWeek:
        'points' in this.#rawData.points_last_week ?
          {
            placement: this.#rawData.points_last_week.rank,
            points: this.#rawData.points_last_week.points
          }
        : null,
      rank:
        'points' in this.#rawData.rank ?
          {
            placement: this.#rawData.rank.rank,
            points: this.#rawData.rank.points
          }
        : null,
      team:
        'points' in this.#rawData.team_rank ?
          {
            placement: this.#rawData.team_rank.rank,
            points: this.#rawData.team_rank.points
          }
        : null
    });

    this.totalCompletionistPoints = this.#rawData.points.total;
    this.favoriteServer = ServerRegion[this.#rawData.favorite_server.server as keyof typeof ServerRegion] ?? ServerRegion.UNK;

    this.finishes = new Finishes({
      first: new Finish({
        mapName: this.#rawData.first_finish.map,
        timestamp: dePythonifyTime(this.#rawData.first_finish.timestamp),
        timeSeconds: this.#rawData.first_finish.time
      }),
      recent: this.#rawData.last_finishes.map(
        f =>
          new RecentFinish({
            mapName: f.map,
            mapType: MapType[Object.entries(MapType).find(e => e[1] === f.type)?.[0] as unknown as keyof typeof MapType] ?? MapType.unknown,
            server: f.country,
            timeSeconds: f.time,
            timestamp: dePythonifyTime(f.timestamp)
          })
      )
    });

    this.favoritePartners = this.#rawData.favorite_partners.map(
      p =>
        new Partner({
          name: p.name,
          finishes: p.finishes
        })
    );

    const keys = Object.keys(MapType).filter(k => k !== 'unknown');

    const servers: ServerStats[] = keys.map(k => {
      const raw = this.#rawData.types[MapType[k as keyof typeof MapType]];

      const leaderboard = new Leaderboard({
        completionist:
          'points' in raw.points ?
            {
              placement: raw.points.rank,
              points: raw.points.points
            }
          : null,
        rank:
          'points' in raw.rank ?
            {
              placement: raw.rank.rank,
              points: raw.rank.points
            }
          : null,
        team:
          'points' in raw.team_rank ?
            {
              placement: raw.team_rank.rank,
              points: raw.team_rank.points
            }
          : null
      });

      const maps = Object.keys(raw.maps).map(key => {
        const map = raw.maps[key];

        if (map.finishes === 0) {
          return new UncompletedMapStats({
            mapName: key,
            mapType: MapType[k as keyof typeof MapType],
            pointsReward: map.points
          });
        } else {
          // TS is dumb
          const casted = map as {
            points: number;
            rank: number;
            first_finish: number;
            time: number;
            finishes: number;
            total_finishes: number;
            team_rank?: number | undefined;
          };

          return new CompletedMapStats({
            bestTimeSeconds: casted.time,
            finishCount: casted.finishes,
            firstFinishTimestamp: dePythonifyTime(casted.first_finish),
            mapName: key,
            mapType: MapType[k as keyof typeof MapType],
            pointsReward: casted.points,
            rank: casted.rank,
            teamRank: casted.team_rank
          });
        }
      });

      const server = new ServerStats({
        name: MapType[k as keyof typeof MapType],
        leaderboard,
        maps,
        totalCompletionistPoints: raw.points.total
      });

      return server;
    });

    this.serverTypes = new Servers(servers);

    this.activity = this.#rawData.activity.map(a => new Activity({ date: a.date, hoursPlayed: a.hours_played }));

    this.hoursPlayedPast365days = this.#rawData.hours_played_past_365_days;

    return this;
  }

  /**
   * Refresh the data for this player.
   */
  public async refresh(): Promise<this> {
    const data = await Player.makeRequest(this.name, true);

    if (data instanceof DDNetError) throw new DDNetError(`Failed to refresh ${this}`, data);

    const parsed = Player.parseObject(data.data);

    if (!parsed.success) throw new DDNetError(`Failed to refresh ${this}`, parsed.error);

    return this.populate(parsed.data);
  }

  /**
   * Returns the name of this player.
   */
  public toString(): string {
    return this.name;
  }
}
