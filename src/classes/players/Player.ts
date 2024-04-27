import axios, { AxiosError, AxiosResponse } from 'axios';
import Keyv from 'keyv';
import { _PlayersJson2, _Schema_players_json2 } from '../../schemas/players/json2.js';
import { DDNetError, MapType, ServerRegion, dePythonifyTime } from '../../util.js';
import { PlayerActivity } from './PlayerActivity.js';
import { PlayerFinish } from './PlayerFinish.js';
import { PlayerFinishes } from './PlayerFinishes.js';
import { PlayerGlobalLeaderboard } from './PlayerGlobalLeaderboard.js';
import { PlayerLeaderboard } from './PlayerLeaderboard.js';
import { FinishedPlayerMap, UnfinishedPlayerMap } from './PlayerMap.js';
import { PlayerPartner } from './PlayerPartner.js';
import { PlayerRankingRanked, PlayerRankingUnranked } from './PlayerRanking.js';
import { PlayerRecentFinish } from './PlayerRecentFinish.js';
import { PlayerServerType } from './PlayerServerType.js';
import { PlayerServerTypes } from './PlayerServerTypes.js';

/**
 * Class representing a DDNet player.
 * @example
 * ```ts
 *  const coolGuy = await Player.new('Sans3108');
 *
 *  console.log(coolGuy.favoriteServer); // "GER"
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
   * "Time-To-Live" - How much time before a cached object becomes stale, and thus removed automatically.
   */
  private static ttl: number = 2 * 60 * 60 * 1000; // 2 hours

  /**
   * Sets the {@link Player.ttl TTL} for the {@link Player.cache Player responses cache}. Old objects are unaffected.
   * @param timeMS The TTL time in milliseconds.
   */
  public static setTTL(timeMS: number): void {
    this.ttl = timeMS;
  }

  /**
   * Clears the {@link Player.cache Player responses cache}.
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
   * Global leaderboards ranks and points for this player.
   */
  public globalLeaderboard!: PlayerGlobalLeaderboard;

  /**
   * Total amount of points earnable from first completions across all DDNet maps.
   */
  public totalCompletionistPoints!: number;

  /**
   * The favorite server region of this player.
   */
  public favoriteServer!: ServerRegion;

  /**
   * First and recent finishes for this player.
   */
  public finishes!: PlayerFinishes;

  /**
   * Favorite partners of this player.
   */
  public favoritePartners!: PlayerPartner[];

  /**
   * Server types for this player along with information about each one.
   */
  public serverTypes!: PlayerServerTypes;

  /**
   * Daily player activity
   */
  public activity!: PlayerActivity[];

  /**
   * Number of hours played in the past 365 days by this player.
   */
  public hoursPlayedPast365days!: number;

  //#endregion

  /**
   * Create a new instance of {@link Player} from API data.
   * Not intended to be used, use {@link new Player.new} instead.
   * @param rawData The raw data for this player.
   */
  private constructor(rawData: _PlayersJson2) {
    this.populate(rawData);
  }

  /**
   * Fetch, parse and construct a new {@link Player} instance.
   * @param nameOrUrl The name or ddnet.org url of this player.
   * @param bypassCache Wether to bypass the player data cache.
   */
  public static async new(nameOrUrl: string, bypassCache = false): Promise<Player> {
    const response = await this.makeRequest(nameOrUrl, bypassCache);

    if (response instanceof DDNetError) throw response;

    const parsed = this.parseObject(response.data);

    if (!parsed.success) throw parsed.error;

    return new this(parsed.data);
  }

  /**
   * Parse an object using the player raw data zod schema.
   * @param data The object to be parsed.
   */
  private static parseObject(data: object): { success: true; data: _PlayersJson2 } | { success: false; error: DDNetError } {
    const parsed = _Schema_players_json2.safeParse(data);

    if (parsed.success) return { success: true, data: parsed.data };

    return { success: false, error: new DDNetError(parsed.error.message, parsed.error) };
  }

  /**
   * Fetch the player data from the API.
   * @param nameOrUrl The name or url of the player.
   * @param force Wether to bypass the cache.
   */
  public static async makeRequest(nameOrUrl: string, force = false): Promise<{ data: object; fromCache: boolean } | DDNetError> {
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
   * @param rawData The raw player data.
   */
  private populate(rawData: _PlayersJson2): this {
    this.#rawData = rawData;

    this.name = this.#rawData.player;
    this.url = `https://ddnet.org/players/${encodeURIComponent(this.name)}`;

    if (!this.#rawData.points.rank) throw new DDNetError('Player points assumption turned out to be null.');

    this.globalLeaderboard = new PlayerGlobalLeaderboard({
      completionist: {
        rank: this.#rawData.points.rank,
        points: this.#rawData.points.points
      },
      completionistLastMonth: this.#rawData.points_last_month,
      completionistLastWeek: this.#rawData.points_last_week,
      rank: this.#rawData.rank,
      team: this.#rawData.team_rank
    });

    this.totalCompletionistPoints = this.#rawData.points.total;
    this.favoriteServer = ServerRegion[this.#rawData.favorite_server.server as keyof typeof ServerRegion] ?? ServerRegion.UNK;

    this.finishes = new PlayerFinishes({
      first: new PlayerFinish({
        mapName: this.#rawData.first_finish.map,
        timestamp: dePythonifyTime(this.#rawData.first_finish.timestamp),
        timeSeconds: this.#rawData.first_finish.time
      }),
      recent: this.#rawData.last_finishes.map(
        f =>
          new PlayerRecentFinish({
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
        new PlayerPartner({
          name: p.name,
          finishes: p.finishes
        })
    );

    const keys = Object.keys(MapType).filter(k => k !== 'unknown');

    const servers: PlayerServerType[] = keys.map(k => {
      const raw = this.#rawData.types[MapType[k as keyof typeof MapType]];

      const leaderboard = new PlayerLeaderboard({
        completionist:
          raw.points.rank ?
            new PlayerRankingRanked({
              rank: raw.points.rank,
              points: raw.points.points
            })
          : new PlayerRankingUnranked(),
        rank:
          raw.rank.rank ?
            new PlayerRankingRanked({
              rank: raw.rank.rank,
              points: raw.rank.points
            })
          : new PlayerRankingUnranked(),
        team:
          raw.team_rank.rank ?
            new PlayerRankingRanked({
              rank: raw.team_rank.rank,
              points: raw.team_rank.points
            })
          : new PlayerRankingUnranked()
      });

      const maps = Object.keys(raw.maps).map(key => {
        const map = raw.maps[key];

        if (map.finishes === 0) {
          return new UnfinishedPlayerMap({
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

          return new FinishedPlayerMap({
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

      const server = new PlayerServerType({
        name: MapType[k as keyof typeof MapType],
        leaderboard,
        maps,
        totalCompletionistPoints: raw.points.total
      });

      return server;
    });

    this.serverTypes = new PlayerServerTypes(servers);

    this.activity = this.#rawData.activity.map(a => new PlayerActivity({ date: a.date, hoursPlayed: a.hours_played }));

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

  public toString(): string {
    return this.name;
  }
}

// const players = ['Cor', 'Freezestyler', 'Aoe', 'BaumWolle', 'Sans3108', 'Starkiller', 'Cireme', 'n9'];

// for (const name of players) {
//   const p = await Player.new(name);

//   if (p instanceof DDNetError) {
//     console.log(p);
//     continue;
//   }

//   const serverTypes = Object.keys(p._rawData.types);

//   const top10ranks = [];
//   let points: number = 0;

//   for (const type of serverTypes) {
//     const maps = p._rawData.types[type].maps;

//     for (const key in maps) {
//       //@ts-ignore
//       const map: {
//         points: number;
//         rank: number;
//         first_finish: number;
//         time: number;
//         finishes: number;
//         total_finishes: number;
//         team_rank?: number | undefined;
//       } = maps[key];

//       if (map.finishes === 0) continue;
//       if (!map.team_rank) continue;

//       if (map.team_rank <= 10) {
//         top10ranks.push(map);

//         const placementPoints = {
//           1: 25,
//           2: 18,
//           3: 15,
//           4: 12,
//           5: 10,
//           6: 8,
//           7: 6,
//           8: 4,
//           9: 2,
//           10: 1
//         };

//         // points += map.points;

//         if (type !== 'Fun') {
//           //@ts-ignore
//           points += placementPoints[map.team_rank];
//         }
//       }
//     }
//   }

//   console.log(`${name}: ${top10ranks.length} team top ranks (${points} points)`);
// }
