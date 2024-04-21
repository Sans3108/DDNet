// ddnet.org/maps/?json=

import { z } from 'zod';

/**
 * The zod schema for map data, as constructed by [maps.py](https://github.com/ddnet/ddnet-scripts/blob/master/servers/scripts/maps.py) when the query includes `json`.
 */
export const _Schema_maps_json = z.object({
  name: z.string(),
  website: z.string(),
  thumbnail: z.string(),
  web_preview: z.string(),
  type: z.string(),
  points: z.number(),
  difficulty: z.number(),
  mapper: z.string(),
  release: z.number().optional(),
  biggest_team: z.number(),
  width: z.number(),
  height: z.number(),
  tiles: z.array(z.string()),
  team_ranks: z.array(
    z.object({
      rank: z.number(),
      time: z.number(),
      timestamp: z.number(),
      country: z.string(),
      players: z.array(z.string())
    })
  ),
  ranks: z.array(
    z.object({
      rank: z.number(),
      time: z.number(),
      timestamp: z.number(),
      country: z.string(),
      player: z.string()
    })
  ),
  max_finishes: z.array(
    z.object({
      rank: z.number(),
      player: z.string(),
      num: z.number(),
      time: z.number(),
      min_timestamp: z.number(),
      max_timestamp: z.number()
    })
  ),
  median_time: z.number().optional(),
  first_finish: z.number().optional(),
  last_finish: z.number().optional(),
  finishes: z.number().optional(),
  finishers: z.number().optional()
});

/**
 * Raw player data type, inferred from {@link _Schema_maps_json}
 */
export type _MapsJson = z.infer<typeof _Schema_maps_json>;
