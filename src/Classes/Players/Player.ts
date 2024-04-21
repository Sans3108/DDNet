import { PlayerFinishes, PlayerLeaderboards, PlayerPartner } from '@classes';
import { _PlayersJson2, _Schema_players_json2 } from '@schemas';
import { DDNetError, makeRequest, timeString } from '@util';

export interface BasePlayerMap {
  mapName: string;
  mapType: string;
  points: number;
  toMap: () => Promise<void>;
}

export interface UnfinishedMap extends BasePlayerMap {
  finishes: 0;
}

export interface FinishedMap extends BasePlayerMap {
  rank: number;
  first_finish: number;
  time: number;
  finishes: number;
  team_rank?: number;
}

export type PlayerMap = UnfinishedMap | FinishedMap;

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
  public leaderboards: PlayerLeaderboards;

  public totalCompletionistPoints: number;

  public favoriteServer: string;

  public finishes: PlayerFinishes;

  public favoritePartners: PlayerPartner[];

  /**
   * Create a new instance of {@link Player} from API data.
   */
  public constructor(rawData: _PlayersJson2) {
    this.#_rawData = rawData;

    console.log(this.#_rawData);

    this.name = this.#_rawData.player;
    this.url = `https://ddnet.org/players/${encodeURIComponent(this.name)}`;

    if (!this.#_rawData.points.rank) throw new DDNetError('Player points assumption turned out to be null.');

    this.leaderboards = {
      completionist: {
        rank: this.#_rawData.points.rank,
        points: this.#_rawData.points.points
      },
      completionistLastMonth: this.#_rawData.points_last_month,
      completionistLastWeek: this.#_rawData.points_last_week,
      rank: this.#_rawData.rank,
      team: this.#_rawData.team_rank
    };

    this.totalCompletionistPoints = this.#_rawData.points.total;
    this.favoriteServer = this.#_rawData.favorite_server.server;

    this.finishes = {
      first: {
        mapName: this.#_rawData.first_finish.map,
        timestamp: this.#_rawData.first_finish.timestamp * 1000,
        timeSeconds: this.#_rawData.first_finish.time,
        timeString: timeString(this.#_rawData.first_finish.time)
      },
      recent: this.#_rawData.last_finishes.map(f => ({
        mapName: f.map,
        mapType: f.type,
        server: f.country,
        timeSeconds: f.time,
        timestamp: f.timestamp,
        timeString: timeString(f.time)
      }))
    };

    this.favoritePartners = this.#_rawData.favorite_partners.map(p => ({
      name: p.name,
      finishes: p.finishes
    }));
  }

  /**
   * Fetch, parse and construct a new {@link Player} instance.
   * @param name The name of this player.
   */
  public static async new(name: string): Promise<Player | DDNetError> {
    const response = await makeRequest('players', 'json2', name);

    if (response instanceof DDNetError) return response;

    const parsed = _Schema_players_json2.safeParse(response);

    if (parsed.success) return new Player(parsed.data);

    return new DDNetError(parsed.error.message, parsed.error);
  }

  #getServerType() {}

  #mapPool() {
    const pool: PlayerMap[] = [];

    for (const type in this.#_rawData.types) {
      const maps = this.#_rawData.types[type].maps;

      for (const mapName in maps) {
        //@ts-expect-error
        pool.push(maps[mapName]);
      }
    }

    return pool;
  }
}

const p = await Player.new(process.argv[2]);

if (p instanceof DDNetError) {
  console.error(p);
} else {
  console.log(p);
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
