import { z } from 'zod';

/**
 * The zod schema for server status data.
 *
 * @see
 * https://ddnet.org/status/json/stats.json
 *
 * @remarks
 * I'm not sure where the code reponsible for these types lives, so I simply analyzed the output to create the schema.
 *
 * @internal
 */
export const _Schema_status = z.object({
  servers: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      host: z.string(),
      location: z.string(),
      online4: z.boolean(),
      online6: z.boolean(),
      uptime: z.string().optional(),
      load: z.number().optional(),
      network_rx: z.number().optional(),
      network_tx: z.number().optional(),
      packets_rx: z.number().optional(),
      packets_tx: z.number().optional(),
      cpu: z.number().optional(),
      memory_total: z.number().optional(),
      memory_used: z.number().optional(),
      swap_total: z.number().optional(),
      swap_used: z.number().optional(),
      hdd_total: z.number().optional(),
      hdd_used: z.number().optional()
    })
  ),
  updated: z.string()
});

/**
 * Releases data type, inferred from {@link _Schema_status}
 *
 * @internal
 */
export type _ServerStatus = z.infer<typeof _Schema_status>;
