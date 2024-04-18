// ddnet.org/players/?json2=

import { z } from 'zod';

/**
 * The zod schema for player data, as constructed by [players.py](https://github.com/ddnet/ddnet-scripts/blob/master/servers/scripts/players.py) when the query includes `json2`.
 */
export const _Schema_players_json2 = z.object({
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

/**
 * Raw player data type, inferred from {@link _Schema_players_json2}
 */
export type _PlayersJson2 = z.infer<typeof _Schema_players_json2>;
