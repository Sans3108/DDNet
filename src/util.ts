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
