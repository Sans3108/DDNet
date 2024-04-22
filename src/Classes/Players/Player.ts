import { FinishedPlayerMap, MapType, PlayerActivity, PlayerFinish, PlayerFinishes, PlayerGlobalLeaderboard, PlayerLeaderboard, PlayerPartner, PlayerRankingRanked, PlayerRankingUnranked, PlayerRecentFinish, PlayerServer, PlayerServerTypes, UnfinishedPlayerMap } from '@classes';
import { _PlayersJson2, _Schema_players_json2 } from '@schemas';
import { DDNetError, makeRequest } from '@util';

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
   * Global leaderboards ranks and points for this player.
   */
  public globalLeaderboard: PlayerGlobalLeaderboard;

  public totalCompletionistPoints: number;

  public favoriteServer: string;

  public finishes: PlayerFinishes;

  public favoritePartners: PlayerPartner[];

  public serverTypes: PlayerServerTypes;

  public activity: PlayerActivity[];

  public hoursPlayedPast365days: number;

  /**
   * Create a new instance of {@link Player} from API data.
   */
  public constructor(rawData: _PlayersJson2) {
    this.#_rawData = rawData;

    this.name = this.#_rawData.player;
    this.url = `https://ddnet.org/players/${encodeURIComponent(this.name)}`;

    if (!this.#_rawData.points.rank) throw new DDNetError('Player points assumption turned out to be null.');

    this.globalLeaderboard = new PlayerGlobalLeaderboard({
      completionist: {
        rank: this.#_rawData.points.rank,
        points: this.#_rawData.points.points
      },
      completionistLastMonth: this.#_rawData.points_last_month,
      completionistLastWeek: this.#_rawData.points_last_week,
      rank: this.#_rawData.rank,
      team: this.#_rawData.team_rank
    });

    this.totalCompletionistPoints = this.#_rawData.points.total;
    this.favoriteServer = this.#_rawData.favorite_server.server;

    this.finishes = new PlayerFinishes({
      first: new PlayerFinish({
        mapName: this.#_rawData.first_finish.map,
        timestamp: this.#_rawData.first_finish.timestamp * 1000,
        timeSeconds: this.#_rawData.first_finish.time
      }),
      recent: this.#_rawData.last_finishes.map(
        f =>
          new PlayerRecentFinish({
            mapName: f.map,
            mapType: MapType[Object.entries(MapType).find(e => e[1] === f.type)?.[0] as unknown as keyof typeof MapType] ?? MapType.unknown,
            server: f.country,
            timeSeconds: f.time,
            timestamp: f.timestamp
          })
      )
    });

    this.favoritePartners = this.#_rawData.favorite_partners.map(
      p =>
        new PlayerPartner({
          name: p.name,
          finishes: p.finishes
        })
    );

    const keys = Object.keys(MapType).filter(k => k !== 'unknown');

    const servers: PlayerServer[] = keys.map(k => {
      const raw = this.#_rawData.types[MapType[k as keyof typeof MapType]];

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
            firstFinishTimestamp: casted.first_finish,
            mapName: key,
            mapType: MapType[k as keyof typeof MapType],
            pointsReward: casted.points,
            rank: casted.rank,
            teamRank: casted.team_rank
          });
        }
      });

      const server = new PlayerServer({
        name: MapType[k as keyof typeof MapType],
        leaderboard,
        maps,
        totalCompletionistPoints: raw.points.total
      });

      return server;
    });

    this.serverTypes = new PlayerServerTypes(servers);

    this.activity = this.#_rawData.activity.map(a => new PlayerActivity({ date: a.date, hoursPlayed: a.hours_played }));

    this.hoursPlayedPast365days = this.#_rawData.hours_played_past_365_days;
  }

  /**
   * Fetch, parse and construct a new {@link Player} instance.
   * @param name The name of this player.
   */
  public static async new(name: string): Promise<{ success: true; instance: Player } | { success: false; error: DDNetError }> {
    const response = await makeRequest('players', 'json2', name);

    if (response instanceof DDNetError) return { success: false, error: response };

    const parsed = _Schema_players_json2.safeParse(response);

    if (parsed.success) return { success: true, instance: new Player(parsed.data) };

    return { success: false, error: new DDNetError(parsed.error.message, parsed.error) };
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
