import { z } from 'zod';
import axios from 'axios';

export const RawPlayerDataSchema = z.object({
  player: z.string(),
  points: z.intersection(
    z.union([
      z.object({
        rank: z.number(),
        points: z.number()
      }),
      z.object({
        rank: z.null()
      })
    ]),
    z.object({ total: z.number() })
  ),
  team_rank: z.union([
    z.object({
      rank: z.number(),
      points: z.number()
    }),
    z.object({
      rank: z.null()
    })
  ]),
  rank: z.union([
    z.object({
      rank: z.number(),
      points: z.number()
    }),
    z.object({
      rank: z.null()
    })
  ]),
  points_last_month: z.union([
    z.object({
      rank: z.number(),
      points: z.number()
    }),
    z.object({
      rank: z.null()
    })
  ]),
  points_last_week: z.union([
    z.object({
      rank: z.number(),
      points: z.number()
    }),
    z.object({
      rank: z.null()
    })
  ]),
  favorite_server: z.object({
    server: z.string()
  }),
  first_finish: z.object({
    timestamp: z.number(),
    map: z.string(),
    time: z.number()
  }),
  last_finishes: z.array(
    z.object({
      timestamp: z.number(),
      map: z.string(),
      time: z.number(),
      country: z.string(),
      type: z.string()
    })
  ),
  favorite_partners: z.array(
    z.object({
      name: z.string(),
      finishes: z.number()
    })
  ),
  types: z.record(
    z.string(),
    z.object({
      points: z.union([
        z.object({
          rank: z.number(),
          points: z.number(),
          total: z.number()
        }),
        z.object({
          rank: z.null(),
          total: z.number()
        })
      ]),
      team_rank: z.union([
        z.object({
          rank: z.number(),
          points: z.number()
        }),
        z.object({
          rank: z.null()
        })
      ]),
      rank: z.union([
        z.object({
          rank: z.number(),
          points: z.number()
        }),
        z.object({
          rank: z.null()
        })
      ]),
      maps: z.record(
        z.string(),
        z.union([
          z.object({
            points: z.number(),
            total_finishes: z.number(),
            finishes: z.literal(0)
          }),
          z.object({
            points: z.number(),
            total_finishes: z.number(),
            finishes: z.number(),
            team_rank: z.number().optional(),
            rank: z.number(),
            time: z.number(),
            first_finish: z.number()
          })
        ])
      )
    })
  ),
  activity: z.array(
    z.object({
      date: z.string(),
      hours_played: z.number()
    })
  ),
  hours_played_past_365_days: z.number()
});

export type RawPlayerData = z.infer<typeof RawPlayerDataSchema>;

export class PlayerError extends Error {
  constructor(
    reason?: string,
    public context?: unknown
  ) {
    super(reason ?? 'ERR');
  }
}

/**
 * Class representing a DDNet player.
 */
export class Player {
  private _ready: boolean;
  private _data!: RawPlayerData;

  constructor(private readonly name: string) {
    this._ready = false;
  }

  private static isObject(value: any): value is object {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private static async fetchAndParse(name: string): Promise<RawPlayerData | null | PlayerError> {
    const data = await axios
      .get(`https://ddnet.org/players/?json2=${name}`)
      .then(res => {
        if (Player.isObject(res.data)) {
          if (Object.keys(res.data).length === 0) return null;
          return res.data;
        } else return new PlayerError('Unexpected data!', res.data);
      })
      .catch(err => new PlayerError(err.message, err));

    if (!data || data instanceof PlayerError) return data;

    const parsed = RawPlayerDataSchema.safeParse(data);

    if (parsed.success) return parsed.data;

    return new PlayerError(parsed.error.message, parsed.error);
  }

  public async fetch(): Promise<{ success: true } | { success: false; error: PlayerError }> {
    const data = await Player.fetchAndParse(this.name);

    if (data instanceof PlayerError) return { success: false, error: data };

    if (!data) return { success: false, error: new PlayerError(`No data returned for '${this.name}'.`) };

    this._data = data;
    this._ready = true;

    return { success: true };
  }

  /**
   * Wether the instance is ready. (i.e. The player data has been successfuly fetched with {@link Player.fetch})
   */
  public get ready() {
    return this._ready;
  }
}
