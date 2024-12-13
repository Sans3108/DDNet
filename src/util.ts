/**
 * Wrapper class for the {@link Error} built-in class, used as a catch all option and to also provide error context.
 */
export class DDNetError extends Error {
  /**
   * Create a new instance of {@link DDNetError}
   */
  constructor(
    /**
     * The reason for this error.
     */
    reason?: string,

    /**
     * Context for this error, usually an {@link Error} object, array or a string, ultimately unknown type.
     */
    public context?: unknown
  ) {
    super(reason ?? 'No error message provided, see context.');
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
 * Converts a python date time string or timestamp into a valid javascript timestamp.
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
 * Represents the different DDNet server types.
 */
export enum Type {
  novice = 'Novice',
  moderate = 'Moderate',
  brutal = 'Brutal',
  insane = 'Insane',
  dummy = 'Dummy',
  ddmaxEasy = 'DDmaX.Easy',
  ddmaxNext = 'DDmaX.Next',
  ddmaxPro = 'DDmaX.Pro',
  ddmaxNut = 'DDmaX.Nut',
  oldschool = 'Oldschool',
  solo = 'Solo',
  race = 'Race',
  fun = 'Fun',
  unknown = 'UNKNOWN'
}

/**
 * Represents server regions.
 *
 * @see
 * https://github.com/ddnet/ddnet-web/tree/master/www/countryflags
 */
export enum Region {
  ARG = 'ARG',
  AUS = 'AUS',
  BRA = 'BRA',
  CAN = 'CAN',
  CHL = 'CHL',
  CHN = 'CHN',
  COL = 'COL',
  CRI = 'CRI',
  EUR = 'EUR',
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
  UNK = 'UNK',
  USA = 'USA',
  ZAF = 'ZAF'
}

/**
 * Represents player countries.
 *
 * @see
 * https://github.com/ddnet/ddnet/tree/master/data/countryflags
 */
export enum Country {
  AD = 'AD',
  AE = 'AE',
  AF = 'AF',
  AG = 'AG',
  AI = 'AI',
  AL = 'AL',
  AM = 'AM',
  AO = 'AO',
  AQ = 'AQ',
  AR = 'AR',
  AS = 'AS',
  AT = 'AT',
  AU = 'AU',
  AW = 'AW',
  AX = 'AX',
  AZ = 'AZ',
  BA = 'BA',
  BB = 'BB',
  BD = 'BD',
  BE = 'BE',
  BF = 'BF',
  BG = 'BG',
  BH = 'BH',
  BI = 'BI',
  BJ = 'BJ',
  BL = 'BL',
  BM = 'BM',
  BN = 'BN',
  BO = 'BO',
  BR = 'BR',
  BS = 'BS',
  BT = 'BT',
  BW = 'BW',
  BY = 'BY',
  BZ = 'BZ',
  CA = 'CA',
  CC = 'CC',
  CD = 'CD',
  CF = 'CF',
  CG = 'CG',
  CH = 'CH',
  CI = 'CI',
  CK = 'CK',
  CL = 'CL',
  CM = 'CM',
  CN = 'CN',
  CO = 'CO',
  CR = 'CR',
  CU = 'CU',
  CV = 'CV',
  CW = 'CW',
  CX = 'CX',
  CY = 'CY',
  CZ = 'CZ',
  DE = 'DE',
  DJ = 'DJ',
  DK = 'DK',
  DM = 'DM',
  DO = 'DO',
  DZ = 'DZ',
  EC = 'EC',
  EE = 'EE',
  EG = 'EG',
  EH = 'EH',
  ER = 'ER',
  'ES-CT' = 'ES-CT',
  'ES-GA' = 'ES-GA',
  ES = 'ES',
  ET = 'ET',
  EU = 'EU',
  FI = 'FI',
  FJ = 'FJ',
  FK = 'FK',
  FM = 'FM',
  FO = 'FO',
  FR = 'FR',
  GA = 'GA',
  'GB-ENG' = 'GB-ENG',
  'GB-NIR' = 'GB-NIR',
  'GB-SCT' = 'GB-SCT',
  'GB-WLS' = 'GB-WLS',
  GB = 'GB',
  GD = 'GD',
  GE = 'GE',
  GF = 'GF',
  GG = 'GG',
  GH = 'GH',
  GI = 'GI',
  GL = 'GL',
  GM = 'GM',
  GN = 'GN',
  GP = 'GP',
  GQ = 'GQ',
  GR = 'GR',
  GS = 'GS',
  GT = 'GT',
  GU = 'GU',
  GW = 'GW',
  GY = 'GY',
  HK = 'HK',
  HN = 'HN',
  HR = 'HR',
  HT = 'HT',
  HU = 'HU',
  ID = 'ID',
  IE = 'IE',
  IL = 'IL',
  IM = 'IM',
  IN = 'IN',
  IO = 'IO',
  IQ = 'IQ',
  IR = 'IR',
  IS = 'IS',
  IT = 'IT',
  JE = 'JE',
  JM = 'JM',
  JO = 'JO',
  JP = 'JP',
  KE = 'KE',
  KG = 'KG',
  KH = 'KH',
  KI = 'KI',
  KM = 'KM',
  KN = 'KN',
  KP = 'KP',
  KR = 'KR',
  KW = 'KW',
  KY = 'KY',
  KZ = 'KZ',
  LA = 'LA',
  LB = 'LB',
  LC = 'LC',
  LI = 'LI',
  LK = 'LK',
  LR = 'LR',
  LS = 'LS',
  LT = 'LT',
  LU = 'LU',
  LV = 'LV',
  LY = 'LY',
  MA = 'MA',
  MC = 'MC',
  MD = 'MD',
  ME = 'ME',
  MF = 'MF',
  MG = 'MG',
  MH = 'MH',
  MK = 'MK',
  ML = 'ML',
  MM = 'MM',
  MN = 'MN',
  MO = 'MO',
  MP = 'MP',
  MQ = 'MQ',
  MR = 'MR',
  MS = 'MS',
  MT = 'MT',
  MU = 'MU',
  MV = 'MV',
  MW = 'MW',
  MX = 'MX',
  MY = 'MY',
  MZ = 'MZ',
  NA = 'NA',
  NC = 'NC',
  NE = 'NE',
  NF = 'NF',
  NG = 'NG',
  NI = 'NI',
  NL = 'NL',
  NO = 'NO',
  NP = 'NP',
  NR = 'NR',
  NU = 'NU',
  NZ = 'NZ',
  OM = 'OM',
  PA = 'PA',
  PE = 'PE',
  PF = 'PF',
  PG = 'PG',
  PH = 'PH',
  PK = 'PK',
  PL = 'PL',
  PM = 'PM',
  PN = 'PN',
  PR = 'PR',
  PS = 'PS',
  PT = 'PT',
  PW = 'PW',
  PY = 'PY',
  QA = 'QA',
  RE = 'RE',
  RO = 'RO',
  RS = 'RS',
  RU = 'RU',
  RW = 'RW',
  SA = 'SA',
  SB = 'SB',
  SC = 'SC',
  SD = 'SD',
  SE = 'SE',
  SG = 'SG',
  SH = 'SH',
  SI = 'SI',
  SK = 'SK',
  SL = 'SL',
  SM = 'SM',
  SN = 'SN',
  SO = 'SO',
  SR = 'SR',
  SS = 'SS',
  ST = 'ST',
  SV = 'SV',
  SX = 'SX',
  SY = 'SY',
  SZ = 'SZ',
  TC = 'TC',
  TD = 'TD',
  TF = 'TF',
  TG = 'TG',
  TH = 'TH',
  TJ = 'TJ',
  TK = 'TK',
  TL = 'TL',
  TM = 'TM',
  TN = 'TN',
  TO = 'TO',
  TR = 'TR',
  TT = 'TT',
  TV = 'TV',
  TW = 'TW',
  TZ = 'TZ',
  UA = 'UA',
  UG = 'UG',
  US = 'US',
  UY = 'UY',
  UZ = 'UZ',
  VA = 'VA',
  VC = 'VC',
  VE = 'VE',
  VG = 'VG',
  VI = 'VI',
  VN = 'VN',
  VU = 'VU',
  WF = 'WF',
  WS = 'WS',
  YE = 'YE',
  ZA = 'ZA',
  ZM = 'ZM',
  ZW = 'ZW',
  default = 'default'
}

// TODO: Merge this into Country directly

/**
 * Map object which holds flag id's for {@link Country} enum members
 *
 * @see
 * https://github.com/ddnet/ddnet/blob/master/data/countryflags/index.txt
 */
export const CountryFlagsMap: Record<keyof typeof Country, number> = {
  'default': -1,
  'GB-ENG': 901,
  'GB-NIR': 902,
  'GB-SCT': 903,
  'GB-WLS': 904,
  'ES-CT': 906,
  'ES-GA': 907,
  'EU': 905,
  'AF': 4,
  'AX': 248,
  'AL': 8,
  'DZ': 12,
  'AS': 16,
  'AD': 20,
  'AO': 24,
  'AQ': 10,
  'AI': 660,
  'AG': 28,
  'AR': 32,
  'AM': 51,
  'AW': 533,
  'AU': 36,
  'AT': 40,
  'AZ': 31,
  'BS': 44,
  'BH': 48,
  'BD': 50,
  'BB': 52,
  'BY': 112,
  'BE': 56,
  'BZ': 84,
  'BJ': 204,
  'BM': 60,
  'BT': 64,
  'BO': 68,
  'BA': 70,
  'BW': 72,
  'BR': 76,
  'IO': 86,
  'BN': 96,
  'BG': 100,
  'BF': 854,
  'BI': 108,
  'KH': 116,
  'CM': 120,
  'CA': 124,
  'CV': 132,
  'KY': 136,
  'CF': 140,
  'TD': 148,
  'CL': 152,
  'CN': 156,
  'CX': 162,
  'CC': 166,
  'CO': 170,
  'KM': 174,
  'CG': 178,
  'CD': 180,
  'CK': 184,
  'CR': 188,
  'CI': 384,
  'HR': 191,
  'CU': 192,
  'CW': 531,
  'CY': 196,
  'CZ': 203,
  'DK': 208,
  'DJ': 262,
  'DM': 212,
  'DO': 214,
  'EC': 218,
  'EG': 818,
  'SV': 222,
  'GQ': 226,
  'ER': 232,
  'EE': 233,
  'ET': 231,
  'FK': 238,
  'FO': 234,
  'FJ': 242,
  'FI': 246,
  'FR': 250,
  'GF': 254,
  'PF': 258,
  'TF': 260,
  'GA': 266,
  'GM': 270,
  'GE': 268,
  'DE': 276,
  'GH': 288,
  'GI': 292,
  'GR': 300,
  'GL': 304,
  'GD': 308,
  'GP': 312,
  'GU': 316,
  'GT': 320,
  'GG': 831,
  'GN': 324,
  'GW': 624,
  'GY': 328,
  'HT': 332,
  'VA': 336,
  'HN': 340,
  'HK': 344,
  'HU': 348,
  'IS': 352,
  'IN': 356,
  'ID': 360,
  'IR': 364,
  'IQ': 368,
  'IE': 372,
  'IM': 833,
  'IL': 376,
  'IT': 380,
  'JM': 388,
  'JP': 392,
  'JE': 832,
  'JO': 400,
  'KZ': 398,
  'KE': 404,
  'KI': 296,
  'KP': 408,
  'KR': 410,
  'KW': 414,
  'KG': 417,
  'LA': 418,
  'LV': 428,
  'LB': 422,
  'LS': 426,
  'LR': 430,
  'LY': 434,
  'LI': 438,
  'LT': 440,
  'LU': 442,
  'MO': 446,
  'MK': 807,
  'MG': 450,
  'MW': 454,
  'MY': 458,
  'MV': 462,
  'ML': 466,
  'MT': 470,
  'MH': 584,
  'MQ': 474,
  'MR': 478,
  'MU': 480,
  'MX': 484,
  'FM': 583,
  'MD': 498,
  'MC': 492,
  'MN': 496,
  'ME': 499,
  'MS': 500,
  'MA': 504,
  'MZ': 508,
  'MM': 104,
  'NA': 516,
  'NR': 520,
  'NP': 524,
  'NL': 528,
  'NC': 540,
  'NZ': 554,
  'NI': 558,
  'NE': 562,
  'NG': 566,
  'NU': 570,
  'NF': 574,
  'MP': 580,
  'NO': 578,
  'OM': 512,
  'PK': 586,
  'PW': 585,
  'PA': 591,
  'PG': 598,
  'PY': 600,
  'PE': 604,
  'PH': 608,
  'PN': 612,
  'PL': 616,
  'PT': 620,
  'PR': 630,
  'PS': 275,
  'QA': 634,
  'RE': 638,
  'RO': 642,
  'RU': 643,
  'RW': 646,
  'BL': 652,
  'SH': 654,
  'KN': 659,
  'LC': 662,
  'MF': 663,
  'PM': 666,
  'VC': 670,
  'WS': 882,
  'SM': 674,
  'ST': 678,
  'SA': 682,
  'SN': 686,
  'RS': 688,
  'SC': 690,
  'SL': 694,
  'SG': 702,
  'SX': 534,
  'SK': 703,
  'SI': 705,
  'SB': 90,
  'SO': 706,
  'SS': 737,
  'ZA': 710,
  'GS': 239,
  'ES': 724,
  'LK': 144,
  'SD': 736,
  'SR': 740,
  'SZ': 748,
  'SE': 752,
  'CH': 756,
  'SY': 760,
  'TW': 158,
  'TJ': 762,
  'TZ': 834,
  'TH': 764,
  'TL': 626,
  'TG': 768,
  'TK': 772,
  'TO': 776,
  'TT': 780,
  'TN': 788,
  'TR': 792,
  'TM': 795,
  'TC': 796,
  'TV': 798,
  'UG': 800,
  'UA': 804,
  'AE': 784,
  'GB': 826,
  'US': 840,
  'UY': 858,
  'UZ': 860,
  'VU': 548,
  'VE': 862,
  'VN': 704,
  'VG': 92,
  'VI': 850,
  'WF': 876,
  'EH': 732,
  'YE': 887,
  'ZM': 894,
  'ZW': 716
} as const;

/**
 * Helper function to translate country flag id to {@link Country}
 */
export function getCountryOrId(id: number): Country;
/**
 * Helper function to translate {@link Country} to country id
 */
export function getCountryOrId(country: Country): number;
/**
 * Helper function to translate {@link Country} enum member keys to country id's and vice-versa
 */
export function getCountryOrId(identifier: number | Country): Country | number {
  if (typeof identifier === 'number') {
    const n = Object.entries<number>(CountryFlagsMap).find(entry => entry[1] === identifier)?.[0] as keyof typeof Country | undefined;

    if (!n) return Country.default;

    return Country[n];
  }

  return CountryFlagsMap[identifier];
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
 * Gets a direct image url from the provided {@link Region}.
 */
export function getImageUrl<T extends 'region'>(
  /**
   * The region to get the image for.
   */
  region: Region,
  kind: T
): `https://raw.githubusercontent.com/ddnet/ddnet-web/master/www/countryflags/${string}.png`;
/**
 * Gets a direct image url from the provided {@link Country}.
 */
export function getImageUrl<T extends 'country'>(
  /**
   * The country to get the image for.
   */
  country: Country,
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
export function getImageUrl<T extends 'region' | 'country' | 'tile'>(eMem: Region | Country | Tile, kind: T): string {
  if (kind === 'country') return `https://raw.githubusercontent.com/ddnet/ddnet/master/data/countryflags/${eMem}.png`;

  if (kind === 'region') return `https://raw.githubusercontent.com/ddnet/ddnet-web/master/www/countryflags/${eMem}.png`;

  if (kind === 'tile') return `https://raw.githubusercontent.com/ddnet/ddnet-web/master/www/tiles/${eMem}.png`;

  throw new DDNetError(`Unknown error.`);
}

/**
 * Splits a mapper name string into an array of mapper names.
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
export function calculatePoints(type: Type, stars: number): number {
  // [multiplier, offset]
  const multiplierAndOffsetMap: Record<Type, [number, number]> = {
    [Type.novice]: [1, 0],
    [Type.moderate]: [2, 5],
    [Type.brutal]: [3, 15],
    [Type.insane]: [4, 30],
    [Type.dummy]: [5, 5],
    [Type.ddmaxEasy]: [4, 0],
    [Type.ddmaxNext]: [4, 0],
    [Type.ddmaxPro]: [4, 0],
    [Type.ddmaxNut]: [4, 0],
    [Type.oldschool]: [6, 0],
    [Type.solo]: [4, 0],
    [Type.race]: [2, 0],
    [Type.fun]: [0, 0],
    [Type.unknown]: [-1, -1]
  };

  const [multiplier, offset] = multiplierAndOffsetMap[type];

  return stars * multiplier + offset;
}
