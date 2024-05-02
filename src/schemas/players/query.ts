// ddnet.org/players/?query=

import { z } from 'zod';

/**
 * The zod schema for player queries.
 *
 * @see
 * [players.py](https://github.com/ddnet/ddnet-scripts/blob/master/servers/scripts/players.py)
 *
 * @internal
 */
export const _Schema_players_query = z.array(
  z.object({
    name: z.string(),
    points: z.number()
  })
);

/**
 * Player query array type, inferred from {@link _Schema_players_query}
 *
 * @internal
 */
export type _PlayersQuery = z.infer<typeof _Schema_players_query>;
