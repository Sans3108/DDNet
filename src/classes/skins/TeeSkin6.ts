/*
Huge thanks to TeeAssembler-2.0

Saved me a bit of sanity :D
*/

import axios, { AxiosError, AxiosResponse } from 'axios';
import { writeFileSync } from 'fs';
import sharp, { OutputInfo } from 'sharp';
import { DDNetError } from '../../util.js';

//@ts-expect-error No DT types
import { PNG } from 'node-png';

/**
 * Tee skin eye variant types
 */
export type TeeSkin6EyeVariant = keyof {
  [K in 'default' | 'evil' | 'hurt' | 'happy' | 'surprised' as `eye-${K & string}`]: never;
};

/**
 * Tee skin component types
 */
export type TeeSkin6Component = TeeSkin6EyeVariant | 'body' | 'bodyShadow' | 'feet' | 'feetShadow';

/**
 * Depth 2 {@link DeepRequired}
 *
 * @internal
 */
type D2Required<T extends object> = Required<{
  [P in keyof T]: T[P] extends object | undefined ? Required<T[P]> : T[P];
}>;

/**
 * Skin rendering options
 */
export interface RenderOptions6 {
  /**
   * The eye variant to render with.
   *
   * @default
   * "eye-default"
   */
  eyeVariant?: TeeSkin6EyeVariant;
  /**
   * If TW color codes for feet and body are both provided, the tee will be rendered with custom colors.
   */
  customColor?: {
    /**
     * TW code for the body color.
     */
    bodyTWcode?: number | null;
    /**
     * TW code for the feet color.
     */
    feetTWcode?: number | null;
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
 * Tee skin options
 */
export interface TeeSkin6Options {
  /**
   * The type of resource to use, this is to allow for loading local custom skins.
   *
   * @default
   * { type: 'name', name: 'default' }
   */
  skinResource?:
    | {
        /**
         * Type of the resource.
         */
        type: 'name';
        /**
         * Name of the skin to use.
         * Will depend on {@link skinDbUrl} to download the image.
         */
        name: string;
      }
    | {
        /**
         * Type of the resource.
         */
        type: 'buffer';
        /**
         * PNG buffer of the custom skin file.
         */
        buffer: Buffer;
      };
  /**
   * The url to query in case of name type {@link skinResource}.
   *
   * @default
   * "https://skins.scrumplex.net/skin/"
   */
  skinDbUrl?: string;
}

/**
 * Class used to render TW 0.6 skins.
 */
export class TeeSkin6 {
  /**
   * Options for this instance.
   */
  public readonly opts: D2Required<TeeSkin6Options>;

  /**
   * Skin file buffer.
   */
  private ogFileBuf: Buffer;

  /**
   * Construct a new {@link TeeSkin6} instance.
   */
  constructor(options: TeeSkin6Options = {}) {
    this.opts = {
      skinResource: options.skinResource ?? {
        type: 'name',
        name: 'default'
      },
      skinDbUrl: options.skinDbUrl ?? `https://skins.scrumplex.net/skin/`
    };

    if (this.opts.skinResource.type === 'buffer') {
      this.ogFileBuf = this.opts.skinResource.buffer;
    } else this.ogFileBuf = Buffer.from([]);
  }

  /**
   * Populate {@link ogFileBuf} with the skin file buffer.
   *
   * If using local custom skin, it won't do anything. Otherwise it will fetch the skin and store the response buffer.
   */
  private async populateBuffer(): Promise<void> {
    if (this.opts.skinResource.type === 'buffer') return;

    const url = `${this.opts.skinDbUrl}${encodeURIComponent(this.opts.skinResource.name)}.png`;

    const response = await axios
      .get<ArrayBuffer, AxiosResponse<ArrayBuffer>>(url, {
        responseType: 'arraybuffer',
        headers: {
          'Cache-Control': 'no-cache',
          'Accept': 'image/png'
        }
      })
      .catch((err: AxiosError) => (err.response?.status === 404 ? new DDNetError(`Skin not found! Try changing the \`dbUrl\`.`) : new DDNetError(err.cause?.message, err)));

    if (response instanceof DDNetError) throw response;

    if (!response.headers['content-type']) throw new DDNetError('Invalid response type!', response);
    if (response.headers['content-type'] !== 'image/png') throw new DDNetError('Invalid response type!', response);

    const buf = Buffer.from(response.data);
    this.ogFileBuf = buf;
  }

  /**
   * Gets width and height from an image buffer.
   */
  private static async getImgSize(
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
   * Renders a tee image.
   */
  public async render(
    /**
     * Render options to use.
     */
    options: RenderOptions6 = {}
  ): Promise<Buffer> {
    const opts: DeepRequired<RenderOptions6> = {
      customColor: {
        bodyTWcode: options.customColor?.bodyTWcode ?? null,
        feetTWcode: options.customColor?.feetTWcode ?? null
      },
      eyeVariant: options.eyeVariant ?? 'eye-default',
      saveFilePath: options.saveFilePath ?? null,
      size: options.size ?? 96
    };

    await this.populateBuffer();

    const skinFileBuf: Buffer = this.ogFileBuf;

    const skinFileSize = await TeeSkin6.getImgSize(skinFileBuf);

    if (skinFileSize.width / skinFileSize.height !== 2 / 1) throw new DDNetError('Invalid aspect ratio.', { width: skinFileSize.width, height: skinFileSize.height, buf: skinFileBuf });

    const finalSize = opts.size;

    const mult = 2.6;

    const skinRes = Math.round(finalSize * mult);

    const { data: resizedBuf, info } = await sharp(skinFileBuf)
      .resize(skinRes, Math.round(skinRes / 2))
      .png()
      .toBuffer({ resolveWithObject: true });

    const { width, height } = info;

    const w = (p: number) => Math.round((p / 8) * width);
    const h = (p: number) => Math.round((p / 4) * height);

    const meta: {
      [key in TeeSkin6Component]: [number, number, number, number, number]; // [left, top, right, bottom, scale]
    } = {
      'body': [w(0), h(0), w(3), h(3), 1],
      'bodyShadow': [w(3), h(0), w(6), h(3), 1],
      'feet': [w(6), h(1), w(8), h(2), 1.5],
      'feetShadow': [w(6), h(2), w(8), h(3), 1.5],
      'eye-default': [w(2), h(3), w(3), h(4), 1.2],
      'eye-evil': [w(3), h(3), w(4), h(4), 1.2],
      'eye-hurt': [w(4), h(3), w(5), h(4), 1.2],
      'eye-happy': [w(5), h(3), w(6), h(4), 1.2],
      'eye-surprised': [w(7), h(3), w(8), h(4), 1.2]
    };

    const selectedEyesMeta = meta[opts.eyeVariant];

    let [bodyOutput, bodyShadowOutput, feetOutput, feetShadowOutput, eyeOutput] = await Promise.all([TeeSkin6.scaleImage(await TeeSkin6.cropImage(resizedBuf, meta['body'][0], meta['body'][1], meta['body'][2], meta['body'][3]), meta['body'][4]), TeeSkin6.scaleImage(await TeeSkin6.cropImage(resizedBuf, meta['bodyShadow'][0], meta['bodyShadow'][1], meta['bodyShadow'][2], meta['bodyShadow'][3]), meta['bodyShadow'][4]), TeeSkin6.scaleImage(await TeeSkin6.cropImage(resizedBuf, meta['feet'][0], meta['feet'][1], meta['feet'][2], meta['feet'][3]), meta['feet'][4]), TeeSkin6.scaleImage(await TeeSkin6.cropImage(resizedBuf, meta['feetShadow'][0], meta['feetShadow'][1], meta['feetShadow'][2], meta['feetShadow'][3]), meta['feetShadow'][4]), TeeSkin6.scaleImage(await TeeSkin6.cropImage(resizedBuf, selectedEyesMeta[0], selectedEyesMeta[1], selectedEyesMeta[2], selectedEyesMeta[3]), selectedEyesMeta[4])]);

    let [bodyBuf, bodyShadowBuf, feetBuf, feetShadowBuf, eyeBuf] = [bodyOutput.data, bodyShadowOutput.data, feetOutput.data, feetShadowOutput.data, eyeOutput.data];

    if (opts.customColor.bodyTWcode !== null && opts.customColor.feetTWcode !== null) {
      const [bodyBufColored, bodyShadowBufColored, eyeBufColored, feetBufColored, feetShadowBufColored] = await Promise.all([TeeSkin6.colorImage(bodyBuf, TeeSkin6.codeFormat(opts.customColor.bodyTWcode), true), TeeSkin6.colorImage(bodyShadowBuf, TeeSkin6.codeFormat(opts.customColor.bodyTWcode), true), TeeSkin6.colorImage(eyeBuf, TeeSkin6.codeFormat(opts.customColor.bodyTWcode)), TeeSkin6.colorImage(feetBuf, TeeSkin6.codeFormat(opts.customColor.feetTWcode)), TeeSkin6.colorImage(feetShadowBuf, TeeSkin6.codeFormat(opts.customColor.feetTWcode))]);

      bodyBuf = bodyBufColored;
      bodyShadowBuf = bodyShadowBufColored;
      eyeBuf = eyeBufColored;
      feetBuf = feetBufColored;
      feetShadowBuf = feetShadowBufColored;
    }

    const bodyLen = bodyOutput.info.width;
    const bodyPos: [number, number] = [Math.round((finalSize - bodyLen) / 2), Math.round((finalSize - bodyLen) / 2)];

    const renderPos: {
      body: [number, number];
      feet: { back: [number, number]; front: [number, number] };
      eyes: { left: [number, number]; right: [number, number] };
    } = {
      body: bodyPos,
      feet: {
        back: [Math.round(bodyPos[0] - bodyLen * (8 / 64)), Math.round(bodyPos[1] + bodyLen * (30 / 64))],
        front: [Math.round(bodyPos[0] + bodyLen * (8 / 64)), Math.round(bodyPos[1] + bodyLen * (30 / 64))]
      },
      eyes: {
        left: [Math.round(bodyPos[0] + bodyLen * (23 / 64)), Math.round(bodyPos[1] + bodyLen * (15 / 64))],
        right: [Math.round(bodyPos[0] + bodyLen * (31 / 64)), Math.round(bodyPos[1] + bodyLen * (15 / 64))]
      }
    };

    const finalImageBuf = await sharp({
      create: {
        width: finalSize,
        height: finalSize,
        background: 'rgba(0, 0, 0, 0)',
        channels: 4
      }
    })
      .composite([
        {
          input: bodyShadowBuf,
          left: renderPos.body[0],
          top: renderPos.body[1]
        },
        {
          input: feetShadowBuf,
          left: renderPos.feet.back[0],
          top: renderPos.feet.back[1]
        },
        {
          input: feetShadowBuf,
          left: renderPos.feet.front[0],
          top: renderPos.feet.front[1]
        },
        {
          input: feetBuf,
          left: renderPos.feet.back[0],
          top: renderPos.feet.back[1]
        },
        {
          input: bodyBuf,
          left: renderPos.body[0],
          top: renderPos.body[1]
        },
        {
          input: eyeBuf,
          left: renderPos.eyes.left[0],
          top: renderPos.eyes.left[1]
        },
        {
          input: await TeeSkin6.flipImage(eyeBuf),
          left: renderPos.eyes.right[0],
          top: renderPos.eyes.right[1]
        },
        {
          input: feetBuf,
          left: renderPos.feet.front[0],
          top: renderPos.feet.front[1]
        }
      ])
      .png()
      .toBuffer();

    if (opts.saveFilePath) writeFileSync(opts.saveFilePath, finalImageBuf);

    return finalImageBuf;
  }

  /**
   * Flips an image buffer and returns the resulting buffer.
   */
  private static async flipImage(
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
   * Crops and area from an image buffer and returns the resulting buffer
   */
  private static async cropImage(
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
   * Scales an image buffer by some factor and returns the buffer and some additional information from Sharp.
   */
  private static async scaleImage(
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
   * Converts an array of HSL values to an array of RGB values.
   *
   * @see
   * https://github.com/AlexIsTheGuy/TeeAssembler-2.0
   */
  private static HSLToRGB(
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
   * Converts a TW color code into HSL values
   *
   * @see
   * https://github.com/AlexIsTheGuy/TeeAssembler-2.0
   */
  private static codeFormat(
    /**
     * The TW custom color code.
     */
    TWcode: number
  ): [number, number, number] {
    if (isNaN(TWcode)) throw Error(`Invalid code ${TWcode}`);

    if (TWcode < 0 || TWcode > 0xffffff) throw Error(`Invalid value ${TWcode}\nValid format: an integer (min: 0, max: 0xffffff)`);

    let hexColorStr = TWcode.toString(16);

    if (hexColorStr.length < 6) {
      hexColorStr = '0'.repeat(6 - hexColorStr.length) + hexColorStr;
    }

    const chunks = [];

    for (let i = 0; i < hexColorStr.length; i += 2) {
      chunks.push(hexColorStr.slice(i, i + 2));
    }

    const color = chunks.map(x => parseInt(x, 16));
    if (color[0] === 255) {
      color[0] = 0;
    }

    color[0] = (color[0] * 360) / 255;
    color[1] = (color[1] * 100) / 255;
    color[2] = (color[2] / 255 / 2 + 0.5) * 100;

    return [color[0] ?? 0, color[1] ?? 0, color[2] ?? 0];
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
   */
  private static reorderBody(
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
   * Colors an image buffer with the given HSL values.
   */
  private static async colorImage(
    /**
     * The image buffer to color.
     */
    buf: Buffer,
    /**
     * The HSL values to use.
     */
    hsl: [number, number, number],
    /**
     * Should only be set to true for coloring the tee body.
     */
    body?: boolean
  ): Promise<Buffer> {
    const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

    const { width, height, channels } = info;

    if (hsl[2] < 52.5) hsl[2] = 52.5; // Prevent full black/white skins

    const [r, g, b] = TeeSkin6.HSLToRGB(hsl);

    for (let byte = 0; byte < data.length; byte += channels) {
      if (data[byte + 3] > 0) {
        const average = (data[byte] + data[byte + 1] + data[byte + 2]) / 3;

        data[byte] = average;
        data[byte + 1] = average;
        data[byte + 2] = average;
      }
    }

    if (body) buf = TeeSkin6.reorderBody(buf);

    for (let byte = 0; byte < data.length; byte += channels) {
      if (data[byte + 3] > 0) {
        data[byte] = (data[byte] * r) / 255;
        data[byte + 1] = (data[byte + 1] * g) / 255;
        data[byte + 2] = (data[byte + 2] * b) / 255;
      }
    }

    return await sharp(data, { raw: { width, height, channels } }).toFormat('png').toBuffer();
  }
}
