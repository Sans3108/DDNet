import axios, { AxiosError, AxiosResponse } from 'axios';
import { Finish } from './classes/other/Finish.js';
import { _Schema_maps_latest } from './schemas/maps/latest.js';
import { ServerType } from './classes/players/Servers.js';

/**
 * Wrapper class for library errors, used as a catch-all and to provide context.
 */
export class DDNetError extends Error {
  constructor(reason?: string, context?: unknown) {
    super(reason ?? 'No error message provided, see cause for more info.', {
      cause: context
    });

    this.name = 'DDNetError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DDNetError);
    }
  }
}

/**
 * Converts a number of seconds to a DDNet finish time string.
 *
 * @example "03:23"
 */
export function timeString(
  /**
   * The time in seconds to convert.
   */
  totalSeconds: number
): string {
  if (totalSeconds < 0) return '--:--';

  const pad = (s: string) => (s.length < 2 ? `0${s}` : s);

  const hours = Math.floor(totalSeconds / 3600).toString();
  const remainingSecondsAfterHours = totalSeconds % 3600;
  const minutes = Math.floor(remainingSecondsAfterHours / 60).toString();
  const seconds = Math.floor(remainingSecondsAfterHours % 60).toString();

  return hours === '0' ? `${pad(minutes)}:${pad(seconds)}` : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Slugifies a name to safely use it in a url.
 *
 * @see
 * https://github.com/ddnet/ddnet-scripts/blob/master/servers/scripts/ddnet.py#L185
 */
export function slugify(name: string): string {
  const x: string = '[\t !"#$%&\'()*\\-/<=>?@[\\]^_`{|},.:]+';
  let string: string = '';
  for (const c of name) {
    if (c.match(x) || c.charCodeAt(0) >= 128) {
      string += `-${c.charCodeAt(0)}-`;
    } else {
      string += c;
    }
  }
  return string;
}

/**
 * Converts a python datetime string or timestamp into a valid javascript timestamp.
 */
export function dePythonifyTime(
  /**
   * The time to convert.
   */
  time: number | string
): number {
  if (typeof time === 'string') return new Date(time).getTime();

  const d = new Date(time);

  // hacky fix
  if (d.getFullYear() < 2000) return new Date(time * 1000).getTime();

  return d.getTime();
}

/**
 * Represents server regions.
 *
 * @see
 * https://github.com/ddnet/ddnet-web/tree/master/www/countryflags
 */
export enum ServerRegion {
  ARG = 'ARG',
  AUS = 'AUS',
  BRA = 'BRA',
  BHR = 'BHR',
  CAN = 'CAN',
  CHL = 'CHL',
  CHN = 'CHN',
  COL = 'COL',
  CRI = 'CRI',
  EUR = 'EUR',
  FRA = 'FRA',
  GER = 'GER',
  FIN = 'FIN',
  IND = 'IND',
  IRN = 'IRN',
  JAP = 'JAP',
  KOR = 'KOR',
  KSA = 'KSA',
  MEX = 'MEX',
  NLD = 'NLD',
  PER = 'PER',
  POL = 'POL',
  RUS = 'RUS',
  SAU = 'SAU',
  SGP = 'SGP',
  TUR = 'TUR',
  TWN = 'TWN',
  UAE = 'UAE',
  UKR = 'UKR',
  USA = 'USA',
  ZAF = 'ZAF',
  OLD = 'OLD',
  UNK = 'UNK' // custom unknown region
}

/**
 * Represents player countries and their ID's.
 *
 * @see
 * https://github.com/ddnet/ddnet/tree/master/data/countryflags
 *
 * @see
 * https://github.com/ddnet/ddnet/blob/master/data/countryflags/index.txt
 */
export enum PlayerCountry {
  // default
  'default' = -1,
  // ISO 3166-2 subdivisions
  'GB-ENG' = 901,
  'GB-NIR' = 902,
  'GB-SCT' = 903,
  'GB-WLS' = 904,
  'ES-CT' = 906,
  'ES-GA' = 907,
  // ISO 3166/MA exceptional reservations
  'EU' = 905,
  // ISO 3166-1 based
  'AF' = 4,
  'AX' = 248,
  'AL' = 8,
  'DZ' = 12,
  'AS' = 16,
  'AD' = 20,
  'AO' = 24,
  'AI' = 660,
  'AQ' = 10,
  'AG' = 28,
  'AR' = 32,
  'AM' = 51,
  'AW' = 533,
  'AU' = 36,
  'AT' = 40,
  'AZ' = 31,
  'BS' = 44,
  'BH' = 48,
  'BD' = 50,
  'BB' = 52,
  'BY' = 112,
  'BE' = 56,
  'BZ' = 84,
  'BJ' = 204,
  'BM' = 60,
  'BT' = 64,
  'BO' = 68,
  // 'BQ' = 535,
  'BA' = 70,
  'BW' = 72,
  // 'BV' = 74,
  'BR' = 76,
  'IO' = 86,
  'BN' = 96,
  'BG' = 100,
  'BF' = 854,
  'BI' = 108,
  'KH' = 116,
  'CM' = 120,
  'CA' = 124,
  'CV' = 132,
  'KY' = 136,
  'CF' = 140,
  'TD' = 148,
  'CL' = 152,
  'CN' = 156,
  'CX' = 162,
  'CC' = 166,
  'CO' = 170,
  'KM' = 174,
  'CG' = 178,
  'CD' = 180,
  'CK' = 184,
  'CR' = 188,
  'CI' = 384,
  'HR' = 191,
  'CU' = 192,
  'CW' = 531,
  'CY' = 196,
  'CZ' = 203,
  'DK' = 208,
  'DJ' = 262,
  'DM' = 212,
  'DO' = 214,
  'EC' = 218,
  'EG' = 818,
  'SV' = 222,
  'GQ' = 226,
  'ER' = 232,
  'EE' = 233,
  'ET' = 231,
  'FK' = 238,
  'FO' = 234,
  'FJ' = 242,
  'FI' = 246,
  'FR' = 250,
  'GF' = 254,
  'PF' = 258,
  'TF' = 260,
  'GA' = 266,
  'GM' = 270,
  'GE' = 268,
  'DE' = 276,
  'GH' = 288,
  'GI' = 292,
  'GR' = 300,
  'GL' = 304,
  'GD' = 308,
  'GP' = 312,
  'GU' = 316,
  'GT' = 320,
  'GG' = 831,
  'GN' = 324,
  'GW' = 624,
  'GY' = 328,
  'HT' = 332,
  // 'HM' = 334,
  'VA' = 336,
  'HN' = 340,
  'HK' = 344,
  'HU' = 348,
  'IS' = 352,
  'IN' = 356,
  'ID' = 360,
  'IR' = 364,
  'IQ' = 368,
  'IE' = 372,
  'IM' = 833,
  'IL' = 376,
  'IT' = 380,
  'JM' = 388,
  'JP' = 392,
  'JE' = 832,
  'JO' = 400,
  'KZ' = 398,
  'KE' = 404,
  'KI' = 296,
  'KP' = 408,
  'KR' = 410,
  'KW' = 414,
  'KG' = 417,
  'LA' = 418,
  'LV' = 428,
  'LB' = 422,
  'LS' = 426,
  'LR' = 430,
  'LY' = 434,
  'LI' = 438,
  'LT' = 440,
  'LU' = 442,
  'MO' = 446,
  'MK' = 807,
  'MG' = 450,
  'MW' = 454,
  'MY' = 458,
  'MV' = 462,
  'ML' = 466,
  'MT' = 470,
  'MH' = 584,
  'MQ' = 474,
  'MR' = 478,
  'MU' = 480,
  // 'YT' = 175,
  'MX' = 484,
  'FM' = 583,
  'MD' = 498,
  'MC' = 492,
  'MN' = 496,
  'ME' = 499,
  'MS' = 500,
  'MA' = 504,
  'MZ' = 508,
  'MM' = 104,
  'NA' = 516,
  'NR' = 520,
  'NP' = 524,
  'NL' = 528,
  'NC' = 540,
  'NZ' = 554,
  'NI' = 558,
  'NE' = 562,
  'NG' = 566,
  'NU' = 570,
  'NF' = 574,
  'MP' = 580,
  'NO' = 578,
  'OM' = 512,
  'PK' = 586,
  'PW' = 585,
  'PA' = 591,
  'PG' = 598,
  'PY' = 600,
  'PE' = 604,
  'PH' = 608,
  'PN' = 612,
  'PL' = 616,
  'PT' = 620,
  'PR' = 630,
  'PS' = 275,
  'QA' = 634,
  'RE' = 638,
  'RO' = 642,
  'RU' = 643,
  'RW' = 646,
  'BL' = 652,
  'SH' = 654,
  'KN' = 659,
  'LC' = 662,
  'MF' = 663,
  'PM' = 666,
  'VC' = 670,
  'WS' = 882,
  'SM' = 674,
  'ST' = 678,
  'SA' = 682,
  'SN' = 686,
  'RS' = 688,
  'SC' = 690,
  'SL' = 694,
  'SG' = 702,
  'SX' = 534,
  'SK' = 703,
  'SI' = 705,
  'SB' = 90,
  'SO' = 706,
  'SS' = 737,
  'ZA' = 710,
  'GS' = 239,
  'ES' = 724,
  'LK' = 144,
  'SD' = 736,
  'SR' = 740,
  // 'SJ' = 744,
  'SZ' = 748,
  'SE' = 752,
  'CH' = 756,
  'SY' = 760,
  'TW' = 158,
  'TJ' = 762,
  'TZ' = 834,
  'TH' = 764,
  'TL' = 626,
  'TG' = 768,
  'TK' = 772,
  'TO' = 776,
  'TT' = 780,
  'TN' = 788,
  'TR' = 792,
  'TM' = 795,
  'TC' = 796,
  'TV' = 798,
  'UG' = 800,
  'UA' = 804,
  'AE' = 784,
  'GB' = 826,
  'US' = 840,
  // 'UM' = 581,
  'UY' = 858,
  'UZ' = 860,
  'VU' = 548,
  'VE' = 862,
  'VN' = 704,
  'VG' = 92,
  'VI' = 850,
  'WF' = 876,
  'EH' = 732,
  'YE' = 887,
  'ZM' = 894,
  'ZW' = 716
}

/**
 * Represents map tiles.
 *
 * @see
 * https://github.com/ddnet/ddnet-web/tree/master/www/tiles
 */
export enum Tile {
  BONUS = 'BONUS',
  BOOST = 'BOOST',
  CHECKPOINT_FIRST = 'CHECKPOINT_FIRST',
  CRAZY_SHOTGUN = 'CRAZY_SHOTGUN',
  DEATH = 'DEATH',
  DFREEZE = 'DFREEZE',
  DOOR = 'DOOR',
  DRAGGER = 'DRAGGER',
  EHOOK_START = 'EHOOK_START',
  HIT_END = 'HIT_END',
  JETPACK_START = 'JETPACK_START',
  JUMP = 'JUMP',
  LASER_STOP = 'LASER_STOP',
  NPC_START = 'NPC_START',
  NPH_START = 'NPH_START',
  OLDLASER = 'OLDLASER',
  PLASMAE = 'PLASMAE',
  PLASMAF = 'PLASMAF',
  PLASMAU = 'PLASMAU',
  POWERUP_NINJA = 'POWERUP_NINJA',
  SOLO_START = 'SOLO_START',
  STOP = 'STOP',
  SUPER_START = 'SUPER_START',
  SWITCH = 'SWITCH',
  SWITCH_TIMED = 'SWITCH_TIMED',
  TELECHECK = 'TELECHECK',
  TELECHECKIN = 'TELECHECKIN',
  TELEIN = 'TELEIN',
  TELEINEVIL = 'TELEINEVIL',
  TELEINHOOK = 'TELEINHOOK',
  TELEINWEAPON = 'TELEINWEAPON',
  TELE_GRENADE = 'TELE_GRENADE',
  TELE_GUN = 'TELE_GUN',
  TELE_LASER = 'TELE_LASER',
  THROUGH = 'THROUGH',
  THROUGH_ALL = 'THROUGH_ALL',
  TUNE = 'TUNE',
  WALLJUMP = 'WALLJUMP',
  WEAPON_GRENADE = 'WEAPON_GRENADE',
  WEAPON_RIFLE = 'WEAPON_RIFLE',
  WEAPON_SHOTGUN = 'WEAPON_SHOTGUN',
  UNKNOWN_TILE = 'UNKNOWN_TILE'
}

/**
 * Gets a direct image url from the provided {@link ServerRegion}.
 *
 * @remarks
 * Some server regions may result in a broken link (404 errors) due to them not existing anymore.
 */
export function getImageUrl<T extends 'region'>(
  /**
   * The region to get the image for.
   */
  region: ServerRegion,
  kind: T
): `https://raw.githubusercontent.com/ddnet/ddnet-web/master/www/countryflags/${string}.png`;
/**
 * Gets a direct image url from the provided {@link PlayerCountry}.
 */
export function getImageUrl<T extends 'country'>(
  /**
   * The country to get the image for.
   */
  country: PlayerCountry,
  kind: T
): `https://raw.githubusercontent.com/ddnet/ddnet/master/data/countryflags/${string}.png`;
/**
 * Gets a direct image url from the provided {@link Tile}.
 */
export function getImageUrl<T extends 'tile'>(
  /**
   * The tile to get the image for.
   */
  tile: Tile,
  kind: T
): `https://raw.githubusercontent.com/ddnet/ddnet-web/master/www/tiles/${string}.png`;
/**
 * @param kind The kind of image wanted, this is used at run-time to determine which url gets returned for overlapping members.
 * @typeParam T Used in combination with the {@link kind} param to also determine the kind of image wanted at compile-time.
 */
export function getImageUrl<T extends 'region' | 'country' | 'tile'>(eMem: ServerRegion | PlayerCountry | Tile, kind: T): string {
  if (kind === 'country') return `https://raw.githubusercontent.com/ddnet/ddnet/master/data/countryflags/${eMem}.png`;

  if (kind === 'region') return `https://raw.githubusercontent.com/ddnet/ddnet-web/master/www/countryflags/${eMem}.png`;

  if (kind === 'tile') return `https://raw.githubusercontent.com/ddnet/ddnet-web/master/www/tiles/${eMem}.png`;

  throw new DDNetError(`Unknown error.`);
}

/**
 * Splits a mapper name string into an array of mapper names.
 *
 * @remarks
 * It does the reverse of {@link formatStringList}
 *
 * @see
 * https://github.com/ddnet/ddnet-scripts/blob/8e0909edbeb5d7a6446349dc66a3beb0f5ddccc7/servers/scripts/ddnet.py#L213
 */
export function splitMappers(mapperNames: string): string[] {
  let names: string[] = mapperNames.split(', ');
  if (names.length) {
    names = names.slice(0, -1).concat(names[names.length - 1].split(' & '));
  }
  return names;
}

/**
 * Calculates map points reward based on difficulty (server type) and star count.
 *
 * @see
 * https://ddnet.org/ranks/fun/#points
 */
export function calculatePoints(type: ServerType, stars: number): number {
  // [multiplier, offset]
  const multiplierAndOffsetMap: Record<ServerType, [number, number]> = {
    [ServerType.novice]: [1, 0],
    [ServerType.moderate]: [2, 5],
    [ServerType.brutal]: [3, 15],
    [ServerType.insane]: [4, 30],
    [ServerType.dummy]: [5, 5],
    [ServerType.ddmaxEasy]: [4, 0],
    [ServerType.ddmaxNext]: [4, 0],
    [ServerType.ddmaxPro]: [4, 0],
    [ServerType.ddmaxNut]: [4, 0],
    [ServerType.oldschool]: [6, 0],
    [ServerType.solo]: [4, 0],
    [ServerType.race]: [2, 0],
    [ServerType.fun]: [0, 0],
    [ServerType.unknown]: [-1, -1]
  };

  const [multiplier, offset] = multiplierAndOffsetMap[type];

  return stars * multiplier + offset;
}

/**
 * Formats an array of strings into a list.
 *
 * @example
 * ```ts
 * const authors = ["Sans3108", "urg"];
 * console.log(formatStringList(authors)); // 'Sans3108 & urg'
 *
 * const authors = ["Sans3108", "urg", "Meloƞ"];
 * console.log(formatStringList(authors)); // 'Sans3108, urg & Meloƞ'
 * ```
 */
export function formatStringList(strings: string[]): string {
  if (strings.length === 0) return '';
  if (strings.length === 1) return strings[0];
  if (strings.length === 2) return `${strings[0]} & ${strings[1]}`;

  return `${strings.slice(0, strings.length - 1).join(', ')} & ${strings[strings.length - 1]}`;
}

/**
 * Filtering options for latest finishes.
 */
export interface LatestFinishesFilters {
  /**
   * Region to filter finishes for.
   */
  region?: ServerRegion;
  /**
   * Server type to filter finishes for.
   */
  serverType?: ServerType;
}

/**
 * Fetch the latest map finishes.
 */
export async function getLatestFinishes(
  /**
   * Filtering options for latest finishes.
   */
  filters?: LatestFinishesFilters
): Promise<Finish[]> {
  const { region, serverType } = filters ?? {};

  let url = `https://ddnet.org/maps/?latest=1`;

  if (region) url += `&country=${region}`;
  if (serverType) url += `&server=${serverType}`;

  const response = await axios.get<object | string, AxiosResponse<object | string>>(url).catch((err: AxiosError) => new DDNetError('An error has occurred while fetching the map data from ddnet.org!', err));

  if (response instanceof DDNetError) throw response;

  const responseData = response.data;

  if (typeof responseData === 'string') throw new DDNetError(`Invalid response!`, responseData);

  const parsed = _Schema_maps_latest.safeParse(responseData);

  if (!parsed.success) throw new DDNetError(parsed.error.message, parsed.error);

  const { data } = parsed;

  return data.map(
    f =>
      new Finish({
        timestamp: dePythonifyTime(f.timestamp),
        mapName: f.map,
        players: [f.name],
        timeSeconds: f.time,
        region: ServerRegion[f.server as keyof typeof ServerRegion] ?? ServerRegion.UNK,
        rank: { placement: -1, points: -1 }
      })
  );
}
