import { _ServerStatus } from '../../schemas/other/status.js';

/**
 * Represents a DDNet server's status.
 *
 * @remarks
 * Documentation missing due to my lack of network knowledge.
 *
 * @see
 * https://github.com/ddnet/ddnet-scripts/blob/8e0909edbeb5d7a6446349dc66a3beb0f5ddccc7/servers/serverstatus-client.py
 */
export class ServerStatus {
  public name: string;

  public domain: string;

  public host: string;

  public location: string;

  public online4: boolean;

  public online6: boolean;

  public uptime: string | null;

  public load: number | null;

  public network_rx: number | null;

  public network_tx: number | null;

  public packets_rx: number | null;

  public packets_tx: number | null;

  public cpu: number | null;

  public memory_total: number | null;

  public memory_used: number | null;

  public swap_total: number | null;

  public swap_used: number | null;

  public hdd_total: number | null;

  public hdd_used: number | null;

  /**
   * Construct a new {@link ServerStatus} instance.
   */
  constructor(data: _ServerStatus['servers'][number]) {
    this.name = data.name;
    this.domain = data.type;
    this.host = data.host;
    this.location = data.location;
    this.online4 = data.online4;
    this.online6 = data.online6;

    this.uptime = data.uptime ?? null;
    this.load = data.load ?? null;
    this.network_rx = data.network_rx ?? null;
    this.network_tx = data.network_tx ?? null;
    this.packets_rx = data.packets_rx ?? null;
    this.packets_tx = data.packets_tx ?? null;
    this.cpu = data.cpu ?? null;
    this.memory_total = data.memory_total ?? null;
    this.memory_used = data.memory_used ?? null;
    this.swap_total = data.swap_total ?? null;
    this.swap_used = data.swap_used ?? null;
    this.hdd_total = data.hdd_total ?? null;
    this.hdd_used = data.hdd_used ?? null;
  }
}
