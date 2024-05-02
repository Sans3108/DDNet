// ddnet.org/maps/?qmapper=

import { z } from 'zod';

/**
 * The zod schema for mapper queries.
 *
 * @see
 * [maps.py](https://github.com/ddnet/ddnet-scripts/blob/master/servers/scripts/maps.py)
 *
 * @internal
 */
export const _Schema_maps_qmapper = z.array(
  z.object({
    mapper: z.string(),
    num_maps: z.number()
  })
);

/**
 * Mapper query array type, inferred from {@link _Schema_maps_qmapper}
 *
 * @internal
 */
export type _MapsQueryMapper = z.infer<typeof _Schema_maps_qmapper>;
