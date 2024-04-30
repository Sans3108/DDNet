// ddnet.org/releases/maps.json

import { z } from 'zod';

/**
 * The zod schema for releases data.
 *
 * @see
 * [releases.py](https://github.com/ddnet/ddnet-scripts/blob/master/servers/scripts/releases.py)
 *
 * @internal
 */
export const _Schema_releases = z.array(
  z.object({
    name: z.string(),
    website: z.string(),
    thumbnail: z.string(),
    web_preview: z.string(),
    type: z.string(),
    points: z.number(),
    difficulty: z.number(),
    mapper: z.string(),
    release: z.string(),
    width: z.number(),
    height: z.number(),
    tiles: z.array(z.string())
  })
);

/**
 * Releases data type, inferred from {@link _Schema_releases}
 *
 * @internal
 */
export type _Releases = z.infer<typeof _Schema_releases>;
