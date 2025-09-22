import axios, { AxiosError, AxiosResponse } from 'axios';
import { _Schema_players_json } from '../../schemas/players/json.js';
import { _PlayersJson2, _Schema_players_json2 } from '../../schemas/players/json2.js';
import { _Schema_players_query } from '../../schemas/players/query.js';
import { DDNetError, RankAvailableRegion, ServerRegion, Type, dePythonifyTime } from '../../util.js';
import { Map } from '../maps/Map.js';
import { CacheManager } from '../other/CacheManager.js';
import { Finish, RecentFinish } from '../other/Finish.js';
import { ActivityEntry } from './ActivityEntry.js';
import { Finishes } from './Finishes.js';
import { GlobalLeaderboard } from './GlobalLeaderboard.js';
import { Leaderboard } from './Leaderboard.js';
import { CompletedMapStats, UncompletedMapStats } from './MapStats.js';
import { Partner } from './Partner.js';
import { ServerStats } from './ServerStats.js';
import { Servers } from './Servers.js';

/**
 * Represents a DDNet player.
 *
 * @example
 * ```ts
 * const coolGuy = await Player.new('Sans3108');
 *
 * console.log(coolGuy.favoriteServer); // "GER"
 * console.log(coolGuy.globalLeaderboard.completionist.points); // 2727
 * ```
 */
export class Player {
  //#region Declarations

  /**
   * Raw data for this player.
   */
  #rawData!: _PlayersJson2; // Marked private with vanilla JS syntax for better logging.

  /**
   * Player responses cache. (8h default TTL)
   */
  private static cache = new CacheManager<object>('player-cache', 8 * 60 * 60 * 1000); // 8h

  /**
   * Sets the TTL (Time-To-Live) for objects in cache.
   */
  public static setTTL = this.cache.setTTL;

  /**
   * Clears the {@link Player.cache}.
   */
  public static clearCache = this.cache.clearCache;

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
   *
   * @remarks Does not include rank information for any finishes, values are set to `-1`.
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
   * Recorded player activity.
   */
  public activity!: ActivityEntry[];

  /**
   * Number of hours played in the past 365 days by this player.
   */
  public hoursPlayedPast365days!: number;

  /**
   * All maps stats for this player.
   */
  public allMapStats!: (UncompletedMapStats | CompletedMapStats)[];

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
   * Parse an object using the player {@link _Schema_players_json2 raw data zod schema}.
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

    const response = await axios.get<object | string, AxiosResponse<object | string>>(url).catch((err: AxiosError) => new DDNetError('An error has occurred while fetching the player data from ddnet.org!', err));

    if (response instanceof DDNetError) return response;

    const data = response.data;

    if (typeof data === 'string') return new DDNetError(`Invalid response!`, data);

    await this.cache.set(url, data);

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
        players: [this.name],
        rank: {
          placement: -1,
          points: -1
        },
        region: RankAvailableRegion.UNK,
        timeSeconds: this.#rawData.first_finish.time,
        timestamp: dePythonifyTime(this.#rawData.first_finish.timestamp)
      }),
      recent: this.#rawData.last_finishes.map(
        f =>
          new RecentFinish({
            mapName: f.map,
            mapType: Type[Object.entries(Type).find(e => e[1] === f.type)?.[0] as unknown as keyof typeof Type] ?? Type.unknown,
            players: [this.name],
            rank: {
              placement: -1,
              points: -1
            },
            region: RankAvailableRegion[f.country as keyof typeof RankAvailableRegion] ?? RankAvailableRegion.UNK,
            timeSeconds: f.time,
            timestamp: dePythonifyTime(f.timestamp)
          })
      )
    });

    this.favoritePartners = this.#rawData.favorite_partners.map(
      p =>
        new Partner({
          name: p.name,
          finishCount: p.finishes
        })
    );

    const keys = Object.keys(Type).filter(k => k !== 'unknown');

    const servers: ServerStats[] = keys.map(k => {
      const raw = this.#rawData.types[Type[k as keyof typeof Type]];

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
            mapType: Type[k as keyof typeof Type],
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
            mapType: Type[k as keyof typeof Type],
            pointsReward: casted.points,
            rank: casted.rank,
            teamRank: casted.team_rank
          });
        }
      });

      const server = new ServerStats({
        name: Type[k as keyof typeof Type],
        leaderboard,
        maps,
        totalCompletionistPoints: raw.points.total
      });

      return server;
    });

    this.serverTypes = new Servers(servers);

    this.activity = this.#rawData.activity.map(a => new ActivityEntry({ date: a.date, hoursPlayed: a.hours_played }));

    this.hoursPlayedPast365days = this.#rawData.hours_played_past_365_days;

    this.allMapStats = [];

    for (const key in this.serverTypes) {
      const k = key as keyof typeof this.serverTypes;

      const maps = this.serverTypes[k].maps;

      this.allMapStats.push(...maps);
    }

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
   * Returns the name and url of this player in markdown format.
   */
  public toString(): string {
    return `[${this.name}](${this.url})`;
  }

  /**
   * Returns an array of objects containing the names of all finished maps and a function to turn them into proper {@link Map} objects.
   */
  public async getAllFinishedMapNames(
    /**
     * Wether to bypass the cache.
     */
    force = false,
    /**
     * The region to pull ranks from in the `toMap` function from the returned value. Omit for global ranks.
     */
    rankSource?: RankAvailableRegion | null
  ): Promise<{ name: string; toMap: () => Promise<Map> }[]> {
    const data = await Player.makeRequest(`https://ddnet.org/players/?json=${encodeURIComponent(this.name)}`, force);

    if (data instanceof DDNetError) throw data;

    const parsed = _Schema_players_json.safeParse(data.data);

    if (!parsed.success) throw new DDNetError(`Failed to parse received data.`, parsed.error);

    return parsed.data.map(map => ({ name: map, toMap: async () => await Map.new(map, rankSource) }));
  }

  /**
   * Search for a player.
   */
  public static async search(
    /**
     * The value to search for.
     */
    value: string,
    /**
     * Wether to bypass the cache.
     */
    force = false
  ): Promise<{ name: string; points: number; toPlayer: () => Promise<Player> }[] | null> {
    const data = await Player.makeRequest(`https://ddnet.org/players/?query=${encodeURIComponent(value)}`, force);

    if (data instanceof DDNetError) throw data;

    const parsed = _Schema_players_query.safeParse(data.data);

    if (!parsed.success) throw new DDNetError(`Failed to parse received data.`, parsed.error);

    if (parsed.data.length === 0) return null;

    return parsed.data.map(player => ({ name: player.name, points: player.points, toPlayer: async () => await Player.new(player.name) }));
  }
}
