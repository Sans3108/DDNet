import axios, { AxiosError, AxiosResponse } from 'axios';
import { _Schema_status, _ServerStatus } from '../../schemas/other/status.js';
import { DDNetError, dePythonifyTime } from '../../util.js';
import { ServerStatus } from './ServerStatus.js';

/**
 * Represents DDNet server statuses.
 */
export class ServerListStatuses {
  //#region Declarations

  /**
   * Raw releases data.
   */
  #rawData!: _ServerStatus; // Marked private with vanilla JS syntax for better logging.

  public servers!: ServerStatus[];

  public lastUpdatedTimestamp!: number;

  //#endregion

  /**
   * Create a new instance of {@link ServerListStatuses} from API data.
   * Not intended to be used, use {@link new ServerListStatuses.new} instead.
   */
  private constructor(
    /**
     * The raw data for this.
     */
    rawData: _ServerStatus
  ) {
    this.populate(rawData);
  }

  /**
   * Fetch, parse and construct a new {@link ServerListStatuses} instance.
   */
  public static async new(): Promise<ServerListStatuses> {
    const response = await this.makeRequest();

    if (response instanceof DDNetError) throw response;

    const parsed = this.parseObject(response);

    if (!parsed.success) throw parsed.error;

    return new this(parsed.data);
  }

  /**
   * Parse an object using the {@link _Schema_status server status raw data zod schema}.
   */
  private static parseObject(
    /**
     * The object to be parsed.
     */
    data: object
  ): { success: true; data: _ServerStatus } | { success: false; error: DDNetError } {
    const parsed = _Schema_status.safeParse(data); // wtf

    if (parsed.success) return { success: true, data: parsed.data };

    return { success: false, error: new DDNetError(parsed.error.message, parsed.error) };
  }

  /**
   * Fetch the server status data from the API.
   */
  private static async makeRequest(): Promise<object | DDNetError> {
    const url = 'https://ddnet.org/status/json/stats.json';

    const response = await axios.get<object | string, AxiosResponse<object | string>>(url).catch((err: AxiosError) => new DDNetError(err.cause?.message, err));

    if (response instanceof DDNetError) return response;

    const data = response.data;

    if (typeof data === 'string') return new DDNetError(`Invalid response!`, data);

    return data;
  }

  /**
   * Populate the object with the raw server status data.
   */
  private populate(
    /**
     * The raw server status data.
     */
    rawData: _ServerStatus
  ): this {
    this.#rawData = rawData;

    this.servers = this.#rawData.servers.map(srv => new ServerStatus(srv));

    this.lastUpdatedTimestamp = dePythonifyTime(parseInt(this.#rawData.updated));

    return this;
  }

  /**
   * Refresh the server status data.
   */
  public async refresh(): Promise<this> {
    const data = await ServerListStatuses.makeRequest();

    if (data instanceof DDNetError) throw new DDNetError(`Failed to refresh releases`, data);

    const parsed = ServerListStatuses.parseObject(data);

    if (!parsed.success) throw new DDNetError(`Failed to refresh releases`, parsed.error);

    return this.populate(parsed.data);
  }
}
