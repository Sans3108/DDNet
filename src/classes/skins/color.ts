type HexChar = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

type StringLength<Str extends string, Acc extends string[] = []> = Str extends `${infer S}${infer Rest}` ? StringLength<Rest, [...Acc, S]> : Acc['length'];
type ValidateLength<Str extends string, Length extends number> = StringLength<Str> extends Length ? Str : never;

type ValidateHex<Color extends string, Cache extends string = ''> =
  Color extends `${infer A}${infer Rest}` ?
    A extends '' ? Cache
    : A extends HexChar ? ValidateHex<Rest, `${Cache}${A}`>
    : never
  : Cache;

type AddHash<T extends string> = `#${T}`;

type ValidateHexStr<T extends string> = T & ValidateHex<T> & ValidateLength<T, 6 | 8 | 3 | 4>;

export type ColorType = 'hex' | 'tw' | 'rgba' | 'hsla';
export type RGBA_Color = { r: number; g: number; b: number; a?: number };
export type HSLA_Color = { h: number; s: number; l: number; a?: number };
export type HEX_Color<T extends string> = AddHash<ValidateHexStr<T>>;

class Color {
  private colors: (RGBA_Color & { format?: ColorType })[] = [];

  public from(tw: number, format?: ColorType): this;
  public from(rgba: RGBA_Color, format?: ColorType): this;
  public from(hsla: HSLA_Color, format?: ColorType): this;
  public from<T extends string>(hex: HEX_Color<T>, format?: ColorType): this;
  public from<T extends string>(input: HEX_Color<T> | number | RGBA_Color | HSLA_Color, format?: ColorType): this {
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

        const r = parseInt(hex.slice(0, 2), 16) / 255;
        const g = parseInt(hex.slice(2, 4), 16) / 255;
        const b = parseInt(hex.slice(4, 6), 16) / 255;
        const a = parseInt(hex.slice(6, 8), 16) / 255;

        this.colors.push({ r, g, b, a, format });
        break;
      }
      case 'number': {

      }
    }

    return this;
  }
}

new Color().from('#a0e63dff');
