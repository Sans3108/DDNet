import { DDNetError } from '../../util.js';

/**
 * Valid hex characters.
 *
 * @internal
 */
export type HexChar = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

/**
 * String length helper.
 *
 * @internal
 */
export type StringLength<Str extends string, Acc extends string[] = []> = Str extends `${infer S}${infer Rest}` ? StringLength<Rest, [...Acc, S]> : Acc['length'];

/**
 * Validates if a string is of a certain length
 *
 * @internal
 */
export type ValidateLength<Str extends string, Length extends number> = StringLength<Str> extends Length ? Str : never;

/**
 * Validates chars in a string to be valid hex.
 *
 * @internal
 */
export type ValidateHex<Color extends string, Cache extends string = ''> =
  Color extends `${infer A}${infer Rest}` ?
    A extends '' ? Cache
    : A extends HexChar ? ValidateHex<Rest, `${Cache}${A}`>
    : never
  : Cache;

/**
 * Prepends `#` to a string.
 *
 * @internal
 */
export type AddHash<T extends string> = `#${T}`;

/**
 * Validates if a string is a valid hex color.
 *
 * @internal
 */
export type ValidateHexStr<T extends string> = T & ValidateHex<T> & ValidateLength<T, 6 | 8 | 3 | 4>;

/**
 * Represents a color type.
 */
export type ColorType = 'hex' | 'tw' | 'rgba' | 'hsla';

/**
 * Represents an RGBA color.
 */
export type RGBA_Color = { r: number; g: number; b: number; a: number };

/**
 * Represents an HSLA color.
 */
export type HSLA_Color = { h: number; s: number; l: number; a: number };

/**
 * Represents a HEX color.
 */
export type HEX_Color<T extends string> = AddHash<ValidateHexStr<T>>;

/**
 * Helper class to convert or pass around colors.
 *
 * @typeParam T used internally.
 */
export class Color<T extends string> {
  /**
   * Stored color in HSLA format.
   */
  private color: HSLA_Color = { h: 0, s: 0, l: 0, a: 0 };

  /**
   * Converts an RGBA color to an HSLA color.
   */
  private static RGBA_to_HSLA(
    /**
     * The RGBA color to convert.
     */
    rgba: RGBA_Color
  ): HSLA_Color {
    let { r, g, b, a } = rgba;

    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    if (delta !== 0) {
      if (max === r) h = 60 * (((g - b) / delta) % 6);
      else if (max === g) h = 60 * ((b - r) / delta + 2);
      else h = 60 * ((r - g) / delta + 4);
    }
    if (h < 0) h += 360;

    let l = (max + min) / 2;
    let s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

    s *= 100;
    l *= 100;

    return { h, s, l, a };
  }

  /**
   * Construct a new {@link Color} instance from a teeworlds color code.
   */
  public static from(
    /**
     * A TeeWorlds color code.
     */
    tw: number
  ): Color<string>;
  /**
   * Construct a new {@link Color} instance from an rgba color.
   */
  public static from(
    /**
     * An RGBA color object with keys for Red (0-255), Green (0-255), Blue (0-255) and optionally Alpha (0-1)
     *
     * @example
     * ```ts
     * const col: RGBA_Color = { r: 169, g: 69, b: 42 }; // optionally add `a` for alpha
     * ```
     */
    rgba: RGBA_Color
  ): Color<string>;
  /**
   * Construct a new {@link Color} instance from an hsla color.
   */
  public static from(
    /**
     * An HSLA color object with keys for Hue (0-360), Saturation (0-100), Lightness (0-100) and optionally Alpha (0-1)
     *
     * @example
     * ```ts
     * const col: HSLA_Color = { h: 169, s: 69, l: 42 }; // optionally add `a` for alpha
     * ```
     */
    hsla: HSLA_Color
  ): Color<string>;
  /**
   * Construct a new {@link Color} instance from a hex color.
   */
  public static from<T extends string>(
    /**
     * A hex color in short or long form, a string starting with `#` followed by either 3, 4, 6 or 8 hex chars.
     *
     * @example
     * ```ts
     * const col1 = '#123';      // short form, no alpha
     * const col2 = '#1234';     // short form, with alpha
     * const col3 = '#123abc';   // long form, no alpha
     * const col4 = '#123abc99'; // long form, with alpha
     * ```
     */
    hex: HEX_Color<T>
  ): Color<string>;
  public static from<T extends string>(input: HEX_Color<T> | number | RGBA_Color | HSLA_Color): Color<string> {
    //@ts-expect-error
    return new Color(input);
  }

  /**
   * Construct a new {@link Color} instance from a teeworlds color code.
   */
  public constructor(
    /**
     * A TeeWorlds color code.
     */
    tw: number
  );
  /**
   * Construct a new {@link Color} instance from an rgba color.
   */
  public constructor(
    /**
     * An RGBA color object with keys for Red (0-255), Green (0-255), Blue (0-255) and optionally Alpha (0-1)
     *
     * @example
     * ```ts
     * const col: RGBA_Color = { r: 169, g: 69, b: 42 }; // optionally add `a` for alpha
     * ```
     */
    rgba: RGBA_Color
  );
  /**
   * Construct a new {@link Color} instance from an hsla color.
   */
  public constructor(
    /**
     * An HSLA color object with keys for Hue (0-360), Saturation (0-100), Lightness (0-100) and optionally Alpha (0-1)
     *
     * @example
     * ```ts
     * const col: HSLA_Color = { h: 169, s: 69, l: 42 }; // optionally add `a` for alpha
     * ```
     */
    hsla: HSLA_Color
  );
  /**
   * Construct a new {@link Color} instance from a hex color.
   */
  public constructor(
    /**
     * A hex color in short or long form, a string starting with `#` followed by either 3, 4, 6 or 8 hex chars.
     *
     * @example
     * ```ts
     * const col1 = '#123';      // short form, no alpha
     * const col2 = '#1234';     // short form, with alpha
     * const col3 = '#123abc';   // long form, no alpha
     * const col4 = '#123abc99'; // long form, with alpha
     * ```
     */
    hex: HEX_Color<T>
  );
  public constructor(input: HEX_Color<T> | number | RGBA_Color | HSLA_Color) {
    switch (typeof input) {
      case 'string': {
        let hex = input.slice(1);

        if (hex.length === 3 || hex.length === 4) {
          hex = hex
            .split('')
            .map(c => c + c)
            .join('');
        }

        if (hex.length === 6) hex += 'ff'; // assume full opacity if no alpha

        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        const a = parseInt(hex.slice(6, 8), 16);

        this.color = Color.RGBA_to_HSLA({ r, g, b, a });

        return;
      }
      case 'number': {
        const byte0 = input & 0xff; // L
        const byte1 = (input >> 8) & 0xff; // S
        const byte2 = (input >> 16) & 0xff; // H
        const byte3 = (input >> 24) & 0xff; // possible alpha

        const a = input > 0xffffff || byte3 !== 0 ? byte3 : 255;
        let h = byte2,
          s = byte1,
          l = byte0;

        if (h === 255) h = 0;

        this.color = {
          h: (h * 360) / 255,
          s: (s * 100) / 255,
          l: (l * 100) / 255,
          a: a / 255
        };

        return;
      }
      default:
        break;
    }

    if ('r' in input) {
      this.color = Color.RGBA_to_HSLA(input);
      return;
    }

    if ('h' in input) {
      this.color = input;
      return;
    }
  }

  public to(format: 'hex'): `#${string}`;
  public to(format: 'tw'): number;
  public to(format: 'rgba'): RGBA_Color;
  public to(format: 'hsla'): HSLA_Color;
  public to(format: ColorType): `#${string}` | number | RGBA_Color | HSLA_Color {
    switch (format) {
      case 'hex': {
        const { r, g, b, a } = this.to('rgba');
        const toHex = (v: number) => v.toString(16).padStart(2, '0');
        return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a ?? 255)}`;
      }
      case 'tw': {
        const { h, s, l, a } = this.color;
        const byteH = Math.round((h / 360) * 255);
        const byteS = Math.round((s / 100) * 255);
        const byteL = Math.round((l / 100) * 255);
        const byteA = a !== undefined && a < 1 ? Math.round(a * 255) : 0;
        return (byteA << 24) | (byteH << 16) | (byteS << 8) | byteL;
      }
      case 'rgba': {
        const { h, s, l, a } = this.color;
        const c = (n: number) => Math.round(n);
        const lRatio = l / 100;
        const sRatio = s / 100;

        const cVal = (1 - Math.abs(2 * lRatio - 1)) * sRatio;
        const x = cVal * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = lRatio - cVal / 2;

        let r1 = 0,
          g1 = 0,
          b1 = 0;
        if (h < 60) [r1, g1, b1] = [cVal, x, 0];
        else if (h < 120) [r1, g1, b1] = [x, cVal, 0];
        else if (h < 180) [r1, g1, b1] = [0, cVal, x];
        else if (h < 240) [r1, g1, b1] = [0, x, cVal];
        else if (h < 300) [r1, g1, b1] = [x, 0, cVal];
        else [r1, g1, b1] = [cVal, 0, x];

        return {
          r: c((r1 + m) * 255),
          g: c((g1 + m) * 255),
          b: c((b1 + m) * 255),
          a
        };
      }
      case 'hsla': {
        return this.color;
      }
      default:
        throw new DDNetError('Invalid format', format);
    }
  }
}
