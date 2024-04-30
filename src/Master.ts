/**
 * Generated using the help of https://quicktype.io/
 *
 * I did not dive into this because the master server is written in rust, and I don't know rust.
 * Besides types, this is (mostly) undocumented and I'm not sure how correct are the types.
 *
 * @module ddnet/master
 * @packageDocumentation
 */

import axios, { AxiosError, AxiosResponse } from 'axios';
import { z } from 'zod';
import { Player } from './DDNet.js';
import { DDNetError } from './util.js';

/**
 * Zod schema for raw master server data.
 *
 * @remarks
 * Translated from types generated by quicktype.
 */
export const _Schema_MasterSrv = z.object({
  servers: z.array(
    z.object({
      addresses: z.array(z.string()),
      location: z.string().optional(),
      info: z.object({
        max_clients: z.number(),
        max_players: z.number(),
        passworded: z.boolean(),
        game_type: z.string(),
        name: z.string(),
        map: z.object({
          name: z.string(),
          sha256: z.string().optional(),
          size: z.number().optional()
        }),
        version: z.string(),
        clients: z.array(
          z.object({
            name: z.string(),
            clan: z.string(),
            country: z.number(),
            score: z.number(),
            is_player: z.boolean(),
            skin: z
              .object({
                name: z.string().optional(),
                color_body: z.number().optional(),
                color_feet: z.number().optional(),
                body: z
                  .object({
                    name: z.string(),
                    color: z.number().optional()
                  })
                  .optional(),
                marking: z
                  .object({
                    name: z.string(),
                    color: z.number().optional()
                  })
                  .optional(),
                decoration: z
                  .object({
                    name: z.string(),
                    color: z.number().optional()
                  })
                  .optional(),
                hands: z
                  .object({
                    name: z.string(),
                    color: z.number().optional()
                  })
                  .optional(),
                feet: z
                  .object({
                    name: z.string(),
                    color: z.number().optional()
                  })
                  .optional(),
                eyes: z
                  .object({
                    name: z.string(),
                    color: z.number().optional()
                  })
                  .optional()
              })
              .optional(),
            afk: z.boolean().optional(),
            team: z.number().optional()
          })
        ),
        client_score_kind: z.string().optional(),
        requires_login: z.boolean().optional(),
        community: z
          .object({
            id: z.string(),
            icon: z.string(),
            admin: z.array(z.string()),
            public_key: z.string(),
            signature: z.string()
          })
          .optional(),
        altameda_net: z.boolean().optional()
      })
    })
  )
});

/**
 * Inferred type of master server data using the zod schema.
 */
export type MasterServerData = z.infer<typeof _Schema_MasterSrv>;

/**
 * Makes a request to the master server.
 *
 * @see
 * https://github.com/ddnet/ddnet/tree/a00d6a311971cafe96f2ec7baf9637a9c5989be4/src/mastersrv
 *
 *
 * https://master1.ddnet.org/ddnet/15/servers.json
 */
export async function makeMasterRequest(
  /**
   * Master server url to use.
   *
   * @default "https://master1.ddnet.org/ddnet/15/servers.json"
   */
  masterSrv?: string
): Promise<object | DDNetError> {
  const url = masterSrv ?? `https://master1.ddnet.org/ddnet/15/servers.json`;

  const response = await axios
    .get<object | string, AxiosResponse<object | string>>(url, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    })
    .catch((err: AxiosError) => new DDNetError(err.cause?.message, err));

  if (response instanceof DDNetError) return response;

  const data = response.data;

  if (typeof data === 'string') return new DDNetError(`Invalid response!`, data);

  return data;
}

/**
 * Makes a request to the master server using {@link makeMasterRequest} and parses the data.
 */
export async function getMasterSrvData(
  /**
   * Master server url to use.
   *
   * @default "https://master1.ddnet.org/ddnet/15/servers.json"
   */
  masterSrv?: string
): Promise<MasterServerData> {
  const data = await makeMasterRequest(masterSrv);

  if (data instanceof DDNetError) throw data;

  const parsed = _Schema_MasterSrv.safeParse(data);

  if (!parsed.success) throw parsed.error;

  return parsed.data;
}

/**
 * Represents a player found on the master server.
 */
export interface MasterSrvFoundPlayer {
  name: string;
  clan: string;
  toPlayer: () => Promise<Player>;
  server: {
    name: string;
    addresses: string[];
  };
}

/**
 * Finds a player on the master server by their name or clan.
 * 
 * @example
 * ```ts
 * const players = await findPlayer('nameless tee');
 *
 * if (players === null) {
 *   console.log('Player not found.');
 * } else {
 *   console.log(`Found ${players.length} player${players.length > 1 ? 's' : ''}:\n${players.map(p => `${p.server.name} | ${p.server.addresses[0].split('//')[1]} | ${p.name} [${p.clan}]`).join('\n')}`);
 * }
 * ```
 */
export async function findPlayer(
  /**
   * The value for search for.
   */
  value: string,
  /**
   * The kind of search to use.
   *
   * @default "name"
   */
  kind: 'name' | 'clan' = 'name'
): Promise<MasterSrvFoundPlayer[] | null> {
  const serverList = (await getMasterSrvData()).servers.map(srv => {
    return {
      name: srv.info.name,
      addresses: srv.addresses,
      clients: srv.info.clients,
      self: srv
    };
  });

  const foundPlayerServers = serverList.filter(srv => {
    return srv.clients.some(c => (kind === 'name' ? c.name === value : c.clan === value));
  });

  if (foundPlayerServers.length === 0) return null;

  return foundPlayerServers.map(srv => {
    const client = srv.clients.find(c => (kind === 'name' ? c.name === value : c.clan === value))!;

    return {
      name: client.name,
      clan: client.clan,
      toPlayer: async () => await Player.new(client.name),
      server: {
        name: srv.name,
        addresses: srv.addresses
      }
    };
  });
}
