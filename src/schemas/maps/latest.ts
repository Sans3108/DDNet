// ddnet.org/maps/?latest=1

import { z } from 'zod';

/**
 * The zod schema for latest finishes.
 *
 * @internal
 */
export const _Schema_maps_latest = z.array(
  z.object({
    timestamp: z.number(),
    map: z.string(),
    name: z.string(),
    time: z.number(),
    server: z.string() // TODO: Fix servers type
  })
);

/**
 * Raw latest finishes data type, inferred from {@link _Schema_maps_latest}
 *
 * @internal
 */
export type _MapsLatest = z.infer<typeof _Schema_maps_latest>;
