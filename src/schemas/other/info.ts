// https://info.ddnet.org/info

import { z } from 'zod';

/**
 * The zod schema for servers info data.
 *
 * @internal
 */
export const _Schema_info_servers = z.object({
  name: z.string(),
  flagId: z.number(),
  servers: z.record(z.string(), z.array(z.string()))
});

/**
 * Servers Info data type, inferred from {@link _Schema_info_servers}
 *
 * @internal
 */
export type _Info_Servers = z.infer<typeof _Schema_info_servers>;

/**
 * The zod schema for info data.
 *
 * @see
 * [info.py](https://github.com/ddnet/ddnet-scripts/blob/be9ac08514ebb183c835f501d7c4bc0b8e23c61c/servers/scripts/info.py)
 *
 * @internal
 */
export const _Schema_info = z.object({
  'servers': z.array(_Schema_info_servers),
  'servers-kog': z.array(_Schema_info_servers),
  'communities': z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      has_finishes: z.boolean(),
      icon: z.object({
        sha256: z.string(),
        url: z.string(),
        servers: z.optional(z.array(_Schema_info_servers))
      }),
      contact_urls: z.array(z.string())
    })
  ),
  'community-icons-download-url': z.string(),
  'news': z.string(),
  'map-download-url': z.string(),
  'location': z.string(),
  'version': z.string(),
  'stun-servers-ipv6': z.array(z.string()),
  'stun-servers-ipv4': z.array(z.string()),
  'warn-pnglite-incompatible-images': z.boolean()
});

/**
 * Info data type, inferred from {@link _Schema_info}
 *
 * @internal
 */
export type _Info = z.infer<typeof _Schema_info>;
