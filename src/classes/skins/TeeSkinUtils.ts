import sharp from 'sharp';
import { DDNetError } from '../../util.js';
import { MasterServerClient } from '../../Master.js';
import { TeeSkin6 } from './TeeSkin6.js';
import { TeeSkin7, assertSkinPart } from './TeeSkin7.js';

/**
 * Tee skin eye variants
 */
export enum TeeSkinEyeVariant {
  normal = 'eye-normal',
  angry = 'eye-angry',
  pain = 'eye-pain',
  happy = 'eye-happy',
  /**
   * Unused, some 0.6 skins have them though
   */
  dead = 'eye-dead',
  surprise = 'eye-surprise',
  blink = 'eye-blink'
}

/**
 * Gets width and height from an image buffer.
 *
 * @internal
 */
export async function getImgSize(
  /**
   * The image buffer to get dimensions from.
   */
  buf: Buffer
): Promise<{ width: number; height: number }> {
  const meta = await sharp(buf).metadata();

  const { width, height } = meta;

  if (!width || !height) throw new DDNetError('Image dimensions could not be found.', { buffer: buf, sharpMetadata: meta });

  return { width, height };
}

/**
 * For the tee body
 * Reorder that the average grey is 192
 *
 * @see
 * https://github.com/ddnet/ddnet/blob/master/src/game/client/components/skins.cpp#L224-L260
 *
 * @internal
 */
export async function reorderBody(
  /**
   * The buffer to work on.
   */
  buf: Buffer
): Promise<{ data: Buffer; info: sharp.OutputInfo }> {
  const raw = await sharp(buf).raw().toBuffer({ resolveWithObject: true });

  buf = raw.data;

  const frequencies = new Array(256).fill(0);
  const newWeight = 192;
  const invNewWeight = 255 - newWeight;

  let orgWeight = 0;

  // Find most common frequency
  for (let byte = 0; byte < buf.length; byte += 4) {
    if (buf[byte + 3] > 128) {
      frequencies[buf[byte]]++;
    }
  }

  for (let i = 1; i < 256; i++) {
    if (frequencies[orgWeight] < frequencies[i]) {
      orgWeight = i;
    }
  }

  // Reorder
  const invOrgWeight = 255 - orgWeight;

  for (let byte = 0; byte < buf.length; byte += 4) {
    let v = buf[byte];

    if (v <= orgWeight && orgWeight == 0) {
      v = 0;
    } else if (v <= orgWeight) {
      v = Math.trunc((v / orgWeight) * newWeight);
    } else if (invOrgWeight == 0) {
      v = newWeight;
    } else {
      v = Math.trunc(((v - orgWeight) / invOrgWeight) * invNewWeight + newWeight);
    }

    buf[byte] = v;
    buf[byte + 1] = v;
    buf[byte + 2] = v;
  }

  return await sharp(buf, {
    raw: {
      channels: 4,
      width: raw.info.width,
      height: raw.info.height
    }
  })
    .png()
    .toBuffer({ resolveWithObject: true });
}

/**
 * Converts a buffer to grayscale.
 */
export async function convertToGrayscale(
  /**
   * The buffer to work on.
   */
  buf: Buffer,
  /**
   * If the buffer should be reordered by the {@link reorderBody} function.
   */
  reorder = false
): Promise<{ data: Buffer; info: sharp.OutputInfo }> {
  const raw = await sharp(buf).raw().toBuffer({ resolveWithObject: true });

  buf = raw.data;

  for (let byte = 0; byte < buf.length; byte += 4) {
    const avg = Math.trunc((buf[byte] + buf[byte + 1] + buf[byte + 2]) / 3);

    buf[byte] = avg;
    buf[byte + 1] = avg;
    buf[byte + 2] = avg;
  }

  let grayscaled = await sharp(buf, {
    raw: {
      channels: 4,
      width: raw.info.width,
      height: raw.info.height
    }
  })
    .png()
    .toBuffer({ resolveWithObject: true });

  if (reorder) grayscaled = await reorderBody(grayscaled.data);

  return grayscaled;
}

/**
 * Tint a buffer with a given HSLA color.
 */
export async function tint(
  /**
   * The buffer to work on.
   */
  buf: Buffer,
  /**
   * The HSLA color to tint the buffer with.
   */
  hsla: HSLA_Color,
  /**
   * Set to true for tinting 0.7 skins.
   */
  use7UnclampVal?: boolean
): Promise<{ data: Buffer; info: sharp.OutputInfo }> {
  const raw = await sharp(buf).raw().toBuffer({ resolveWithObject: true });

  buf = raw.data;

  const darkest6 = 50;
  const darkest7 = (61 / 255) * 100;

  const darkest = use7UnclampVal ? darkest7 : darkest6;

  const { r, g, b, a } = HSLAToRGBA({ ...hsla, l: darkest + (hsla.l * (100 - darkest)) / 100 });

  for (let byte = 0; byte < buf.length; byte += 4) {
    if (buf[byte + 3] === 0) continue; // Skip fully transparent pixels

    buf[byte] = (buf[byte] * r) / 255;
    buf[byte + 1] = (buf[byte + 1] * g) / 255;
    buf[byte + 2] = (buf[byte + 2] * b) / 255;
    buf[byte + 3] = buf[byte + 3] * a;
  }

  return await sharp(buf, {
    raw: {
      channels: 4,
      width: raw.info.width,
      height: raw.info.height
    }
  })
    .png()
    .toBuffer({ resolveWithObject: true });
}

/**
 * Represents an HSLA color.
 */
export type HSLA_Color = { h: number; s: number; l: number; a: number };

/**
 * Converts a TW color code into HSLA values.
 *
 * @remarks Ranges for each component are:
 * Hue: 0-360
 * Sat: 0-100
 * Lht: 0-100
 * Alpha: 0-1
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
): HSLA_Color {
  let { h, s, l, a }: HSLA_Color = { h: 0, s: 0, l: 0, a: 255 };

  if (hasAlpha) {
    a = (twCode >> 24) & 0xff;
    twCode = twCode & 0x00ffffff;
  }

  h = (twCode >> 16) & 0xff;
  s = (twCode >> 8) & 0xff;
  l = twCode & 0xff;

  if (h === 255) h = 0;

  h *= 360 / 255;
  s *= 100 / 255;
  l *= 100 / 255;
  a /= 255;

  return { h, s, l, a };
}

/**
 * Represents an RGBA color.
 */
export type RGBA_Color = { r: number; g: number; b: number; a: number };

/**
 * Converts an HSLA color to an RGBA color.
 *
 * @remarks Ranges for each component are:
 * Red: 0-255
 * Green: 0-255
 * Blue: 0-255
 * Alpha: 0-1
 */
export function HSLAToRGBA(
  /**
   * The HSLA values ordered array.
   */
  hsla: HSLA_Color
): RGBA_Color {
  let { h, s, l, a } = hsla;

  s /= 100;
  l /= 100;

  const k = (n: number) => (n + h / 30) % 12;
  const a2 = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a2 * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));

  const r = Math.round(f(0) * 255);
  const g = Math.round(f(8) * 255);
  const b = Math.round(f(4) * 255);

  return { r, g, b, a };
}

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
  /**
   * The angle in degrees at which the tee should be looking
   *
   * @remarks
   * 0 is right
   *
   * @default
   * 0
   */
  viewAngle?: number;
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

  if (renderOpts?.eyeVariant === TeeSkinEyeVariant.dead) {
    renderOpts.eyeVariant = TeeSkinEyeVariant.normal;
  }

  return await new TeeSkin7({
    body: !assertSkinPart('body', skinData.body?.name) ? undefined : skinData.body.name,
    decoration: !assertSkinPart('decoration', skinData.decoration?.name) ? undefined : skinData.decoration.name,
    eyes: !assertSkinPart('eyes', skinData.eyes?.name) ? undefined : skinData.eyes.name,
    feet: !assertSkinPart('feet', skinData.feet?.name) ? undefined : skinData.feet.name,
    marking: !assertSkinPart('marking', skinData.marking?.name) ? undefined : skinData.marking.name
  }).render({
    ...(renderOpts as Omit<TeeSkinRenderOptions, 'eyeVariant' | 'customColors'> & { eyeVariant?: Exclude<TeeSkinEyeVariant, TeeSkinEyeVariant.dead> }),
    customColors: {
      bodyTWcode: skinData.body?.color,
      markingTWcode: skinData.marking?.color,
      decorationTWcode: skinData.decoration?.color,
      feetTWcode: skinData.feet?.color,
      eyesTWcode: skinData.eyes?.color
    }
  });
}

/**
 * Deep Required type
 *
 * @internal
 */
export type DeepRequired<T extends object> = Required<{
  [P in keyof T]: T[P] extends object | undefined ? DeepRequired<Required<T[P]>> : T[P];
}>;
