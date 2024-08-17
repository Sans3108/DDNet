import { _Info_Servers } from '../../schemas/other/info.js';
import { Region } from '../../util.js';

/**
 * Represents a community server location
 */
export class CommunityServerLocation {
  /**
   * The region of this location.
   */
  public region: string;

  /**
   * The flag id of this location.
   */
  public flagId: number;

  /**
   * Reported server types and addresses for this location.
   */
  public types: { name: string; addresses: string[] }[];

  /**
   * Construct a new {@link CommunityServerLocation} instance.
   */
  constructor(data: { name: string; flagId: number; servers: Record<string, string[]> }) {
    this.region = data.name;
    this.flagId = data.flagId;
    this.types = Object.entries<string[]>(data.servers).map(entry => ({ name: entry[0], addresses: entry[1] }));
  }
}

/**
 * Represents a community.
 */
export class Community {
  /**
   * The id of this community.
   */
  public id: string;

  /**
   * The name of this community.
   */
  public name: string;

  /**
   * Wether to show finishes for maps.
   *
   * @remarks
   * According to https://discord.com/channels/252358080522747904/293493549758939136/1274386594270543954
   * This values decides wether fnished maps have a flag next to them in the server browser on the ddnet client.
   */
  public hasFinishes: boolean;

  /**
   * The icon for this community.
   */
  public icon: {
    /**
     * SHA256 hash of the icon file.
     */
    sha256: string;
    /**
     * The community icon download url.
     */
    url: string;
  };

  /**
   * Server locations for this community along with their reported servers.
   */
  public serverLocations: CommunityServerLocation[];

  /**
   * Construct a new {@link Community} instance.
   */
  constructor(data: {
    id: string;
    name: string;
    has_finishes: boolean;
    icon: {
      sha256: string;
      url: string;
      servers: _Info_Servers[];
    };
    contact_urls: string[];
  }) {
    this.id = data.id;
    this.name = data.name;
    this.hasFinishes = data.has_finishes;
    this.icon = {
      sha256: data.icon.sha256,
      url: data.icon.url
    };
    this.serverLocations = data.icon.servers.map(s => new CommunityServerLocation(s));
  }

  /**
   * Returns a list of all server addresses of this community.
   */
  public getAllServerAddresses(): string[] {
    return this.serverLocations.flatMap(l => l.types.flatMap(t => t.addresses));
  }
}
