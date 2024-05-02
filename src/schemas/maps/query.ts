// ddnet.org/maps/?query=

import { z } from 'zod';

/**
 * The zod schema for map queries.
 *
 * @see
 * [maps.py](https://github.com/ddnet/ddnet-scripts/blob/master/servers/scripts/maps.py)
 *
 * @internal
 */
export const _Schema_maps_query = z.array(
  z.object({
    mapper: z.string(),
    type: z.string(),
    name: z.string()
  })
);

/**
 * Map query array type, inferred from {@link _Schema_maps_query}
 *
 * @internal
 */
export type _MapsQuery = z.infer<typeof _Schema_maps_query>;
