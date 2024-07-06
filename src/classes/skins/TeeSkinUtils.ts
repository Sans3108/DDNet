//@ts-expect-error No DT types
import { PNG } from 'node-png';

import sharp, { OutputInfo } from 'sharp';
import { MasterServerClient, getMasterSrvData } from '../../Master.js';
import { DDNetError } from '../../util.js';
import { TeeSkin6 } from './TeeSkin6.js';
import { TeeSkin7, assertSkinPart } from './TeeSkin7.js';

/**
 * Gets width and height from an image buffer.
 *
 * @internal
 */
export async function getImgSize(
  /**
   * The image buffer to get dimensions from.
   */
  b: Buffer
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const p = new PNG();

    p.parse(b, (err: unknown, data: unknown) => {
      if (err) {
        reject(new DDNetError((err as Error)?.message, err));
      } else {
        const { width, height } = data as { width: number; height: number };

        resolve({ width, height });
      }
    });
  });
}

/**
 * Crops and area from an image buffer and returns the resulting buffer
 *
 * @internal
 */
export async function cropImage(
  /**
   * The image buffer to use.
   */
  buf: Buffer,
  /**
   * Top left x coordinate.
   */
  x1: number,
  /**
   * Top left y coordinate.
   */
  y1: number,
  /**
   * Bottom right x coordinate.
   */
  x2: number,
  /**
   * Bottom right y coordinate.
   */
  y2: number
): Promise<Buffer> {
  return await sharp(buf)
    .extract({
      left: x1,
      top: y1,
      height: y2 - y1,
      width: x2 - x1
    })
    .png()
    .toBuffer();
}

/**
 * Converts an array of HSL values to an array of RGB values.
 *
 * @see
 * https://github.com/AlexIsTheGuy/TeeAssembler-2.0
 *
 * @internal
 */
export function HSLToRGB(
  /**
   * The HSL values ordered array.
   */
  hsl: [number, number, number]
): [number, number, number] {
  const [hue, saturation, lightness] = hsl;

  const chroma = (1 - Math.abs((2 * lightness) / 100 - 1)) * (saturation / 100);
  const huePrime = hue / 60;
  const secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1));

  let red = 0;
  let green = 0;
  let blue = 0;

  const flHuePrime = Math.floor(huePrime);

  if (flHuePrime === 0) {
    red = chroma;
    green = secondComponent;
    blue = 0;
  } else if (flHuePrime === 1) {
    red = secondComponent;
    green = chroma;
    blue = 0;
  } else if (flHuePrime === 2) {
    red = 0;
    green = chroma;
    blue = secondComponent;
  } else if (flHuePrime === 3) {
    red = 0;
    green = secondComponent;
    blue = chroma;
  } else if (flHuePrime === 4) {
    red = secondComponent;
    green = 0;
    blue = chroma;
  } else if (flHuePrime === 5) {
    red = chroma;
    green = 0;
    blue = secondComponent;
  }

  const lightnessAdjustment = lightness / 100 - chroma / 2;

  red = Math.round((red + lightnessAdjustment) * 255);
  green = Math.round((green + lightnessAdjustment) * 255);
  blue = Math.round((blue + lightnessAdjustment) * 255);

  return [red, green, blue];
}

/**
 * Scales an image buffer by some factor and returns the buffer and some additional information from Sharp.
 *
 * @internal
 */
export async function scaleImage(
  /**
   * The image buffer to use.
   */
  buf: Buffer,
  /**
   * The scale factor to use. 1 means 100% or no change.
   */
  scale: number
): Promise<{ data: Buffer; info: OutputInfo }> {
  if (scale === 1) return await sharp(buf).png().toBuffer({ resolveWithObject: true });

  const { width, height } = await sharp(buf).metadata();

  if (!width || !height) throw new DDNetError(`Invalid metadata!`);

  const newWidth = Math.round(width * scale);
  const newHeight = Math.round(height * scale);

  return await sharp(buf).resize(newWidth, newHeight).png().toBuffer({ resolveWithObject: true });
}

/**
 * For the tee body
 * Reorder that the average grey is 192,192,192
 *
 * @see
 * https://github.com/ddnet/ddnet/blob/master/src/game/client/components/skins.cpp#L227-L263
 *
 * @see
 * https://github.com/AlexIsTheGuy/TeeAssembler-2.0
 *
 * @internal
 */
export function reorderBody(
  /**
   * The buffer to work on.
   */
  buf: Buffer
): Buffer {
  const frequencies = new Array<number>(256).fill(0);

  // Find the most common frequence
  for (let byte = 0; byte < buf.length; byte += 4) {
    if (buf[byte + 3] > 128) {
      frequencies[buf[byte]]++;
    }
  }

  const orgWeight = frequencies.indexOf(Math.max(...frequencies));

  // let orgWeight = 0;

  // for (let i = 1; i < 256; i++) {
  //   if (frequencies[orgWeight] < frequencies[i]) {
  //     orgWeight = i;
  //   }
  // }

  const invOrgWeight = 255 - orgWeight;

  const newWeight = 192;
  const invNewWeight = 255 - newWeight;

  for (let byte = 0; byte < buf.length; byte += 4) {
    if (buf[byte] <= orgWeight && orgWeight === 0) {
      continue;
    } else if (buf[byte] <= orgWeight) {
      buf[byte] = Math.trunc((buf[byte] / orgWeight) * newWeight);
    } else if (invOrgWeight == 0) {
      buf[byte] = newWeight;
    } else {
      buf[byte] = Math.trunc(((buf[byte] - orgWeight) / invOrgWeight) * invNewWeight + newWeight);
    }

    buf[byte + 1] = buf[byte];
    buf[byte + 2] = buf[byte];
  }

  return buf;
}

/**
 * Colors an image buffer with the given HSLA values.
 *
 * @internal
 */
export async function colorImage(
  /**
   * The image buffer to color.
   */
  buf: Buffer,
  /**
   * The HSL or HSLA values to use.
   */
  hsla: [number, number, number, number?],
  /**
   * Should only be set to true for coloring a 0.6 tee body part.
   */
  body?: boolean
): Promise<Buffer> {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;

  if (hsla[2] < 37) hsla[2] = 37; //52.5; // Prevent full black/white skins

  const [r, g, b] = HSLToRGB([hsla[0], hsla[1], hsla[2]]);
  const a = hsla[3] ? hsla[3] * 255 : 255;

  for (let byte = 0; byte < data.length; byte += channels) {
    if (data[byte + 3] > 0) {
      const average = (data[byte] + data[byte + 1] + data[byte + 2]) / 3;

      data[byte] = average;
      data[byte + 1] = average;
      data[byte + 2] = average;
    }
  }

  if (body) buf = reorderBody(buf);

  for (let byte = 0; byte < data.length; byte += channels) {
    if (data[byte + 3] > 0) {
      data[byte] = (data[byte] * r) / 255;
      data[byte + 1] = (data[byte + 1] * g) / 255;
      data[byte + 2] = (data[byte + 2] * b) / 255;
      data[byte + 3] = (data[byte + 3] * a) / 255;
    }
  }

  return await sharp(data, { raw: { width, height, channels } }).toFormat('png').toBuffer();
}

/**
 * Converts a TW color code into HSL values
 *
 * @internal
 */
export function HSLAfromTWcode(
  /**
   * The TW custom color code.
   */
  twCode: number,
  /**
   * Set to true if the TW has an encoded alpha value. (For example, 0.7 tees have an alpha value encoded for the marking color)
   */
  hasAlpha?: boolean
): [number, number, number, number] {
  const hsla: [number, number, number, number] = [0, 0, 0, 255];

  if (hasAlpha) {
    hsla[3] = (twCode >> 24) & 0xff;
    twCode = twCode & 0x00ffffff;
  }

  hsla[0] = (twCode >> 16) & 0xff;
  hsla[1] = (twCode >> 8) & 0xff;
  hsla[2] = twCode & 0xff;

  if (hsla[0] === 255) {
    hsla[0] = 0;
  }

  hsla[0] *= 360 / 255;
  hsla[1] *= 100 / 255;
  hsla[2] *= 100 / 255;
  hsla[3] /= 255;

  return hsla;
}

/**
 * Flips an image buffer and returns the resulting buffer.
 *
 * @internal
 */
export async function flipImage(
  /**
   * The image buffer to use.
   */
  buf: Buffer,
  /**
   * If true, flip vertically instead of horizontally.
   */
  vertical?: boolean
): Promise<Buffer> {
  return await sharp(buf)[vertical ? 'flip' : 'flop']().png().toBuffer();
}

/**
 * Tee skin eye variant types
 */
export type TeeSkinEyeVariant = keyof {
  [K in 'default' | 'evil' | 'hurt' | 'happy' | 'surprised' as `eye-${K & string}`]: never;
};

/**
 * Skin rendering options
 */
export interface TeeSkinRenderOptions {
  /**
   * The eye variant to render with.
   *
   * @default
   * "eye-default"
   */
  eyeVariant?: TeeSkinEyeVariant;
  /**
   * Custom colors to use in TW color code format.
   *
   * @remarks
   * Both TW color codes for feet and body must be provided for 0.6 skins.
   */
  customColors?: {
    /**
     * TW code for the body color.
     */
    bodyTWcode?: number | null;
    /**
     * TW code for the marking color.
     */
    markingTWcode?: number | null;
    /**
     * TW code for the decoration color.
     */
    decorationTWcode?: number | null;
    /**
     * TW code for the feet color.
     */
    feetTWcode?: number | null;
    /**
     * TW code for the eyes color.
     */
    eyesTWcode?: number | null;
  };
  /**
   * If provided, will save the output buffer as a png to the specified path.
   *
   * @example
   * "./skins/output.png"
   */
  saveFilePath?: string | null;
  /**
   * The size in pixels of the final image.
   *
   * @default
   * 96
   */
  size?: number;
}

/**
 * Helper function to quickly render any tee using the skin data from any client on any server reported by the master server. Custom colors are automatically handled.
 */
export async function renderTee(
  /**
   * The skin data to use.
   */
  skinData: MasterServerClient['skin'],
  /**
   * Render options excluding custom colors.
   */
  renderOpts?: Omit<TeeSkinRenderOptions, 'customColors'>
): Promise<Buffer> {
  if (!skinData) return await new TeeSkin6().render(renderOpts);

  if (skinData.name) {
    return await new TeeSkin6({ skinResource: skinData.name }).render({
      ...renderOpts,
      customColors: {
        bodyTWcode: skinData.color_body,
        feetTWcode: skinData.color_feet
      }
    });
  }

  return await new TeeSkin7({
    body: !assertSkinPart('body', skinData.body?.name) ? undefined : skinData.body.name,
    decoration: !assertSkinPart('decoration', skinData.decoration?.name) ? undefined : skinData.decoration.name,
    eyes: !assertSkinPart('eyes', skinData.eyes?.name) ? undefined : skinData.eyes.name,
    feet: !assertSkinPart('feet', skinData.feet?.name) ? undefined : skinData.feet.name,
    marking: !assertSkinPart('marking', skinData.marking?.name) ? undefined : skinData.marking.name
  }).render({
    ...renderOpts,
    customColors: {
      bodyTWcode: skinData.body?.color,
      markingTWcode: skinData.decoration?.color,
      decorationTWcode: skinData.eyes?.color,
      feetTWcode: skinData.feet?.color,
      eyesTWcode: skinData.marking?.color
    }
  });
}
