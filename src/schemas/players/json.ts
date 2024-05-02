// ddnet.org/players/?json=

import { z } from 'zod';

/**
 * The zod schema for all completed map names of a player.
 *
 * @see
 * [players.py](https://github.com/ddnet/ddnet-scripts/blob/master/servers/scripts/players.py)
 *
 * @internal
 */
export const _Schema_players_json = z.array(z.string());

/**
 * All completed map names of a player array type, inferred from {@link _Schema_players_json}
 *
 * @internal
 */
export type _PlayersJson = z.infer<typeof _Schema_players_json>;
