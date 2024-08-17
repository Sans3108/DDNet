import axios, { AxiosError, AxiosResponse } from 'axios';
import { writeFileSync } from 'fs';
import sharp from 'sharp';
import { DDNetError } from '../../util.js';
import { CacheManager } from '../other/CacheManager.js';
import { HSLAfromTWcode, TeeSkinEyeVariant, TeeSkinRenderOptions, colorImage, cropImage, flipImage, getImgSize, scaleImage } from './TeeSkinUtils.js';

/**
 * Tee skin component types
 *
 * @internal
 *
 * @privateRemarks
 * Not exported because it seems pointless.
 */
type TeeSkin6Component = TeeSkinEyeVariant | 'body' | 'bodyShadow' | 'feet' | 'feetShadow';

/**
 * Depth 2 {@link DeepRequired}
 *
 * @internal
 *
 * @privateRemarks
 * Not exported because it seems pointless.
 */
type D2Required<T extends object> = Required<{
  [P in keyof T]: T[P] extends object | undefined ? Required<T[P]> : T[P];
}>;

/**
 * Tee skin options
 */
export interface TeeSkin6Options {
  /**
   * The resource to use, pass a {@link Buffer} for loading local custom skins, otherwise a skin name.
   *
   * @default
   * "default"
   */
  skinResource?: string | Buffer;
  /**
   * The url to query in case {@link skinResource} is a string.
   *
   * @remarks
   * The "/" at the end of the url is important.
   *
   * @default
   * "https://skins.scrumplex.net/skin/"
   */
  skinDbUrl?: string;
}

/**
 * Class used to render TW 0.6 skins (ddnet).
 */
export class TeeSkin6 {
  //#region Cache

  /**
   * 0.6 Tee Skin file responses cache.
   */
  private static cache = new CacheManager<ArrayBuffer>('teeSkins6-cache', 24 * 60 * 60 * 1000); // 24h ttl

  /**
   * Sets the TTL (Time-To-Live) for objects in cache.
   */
  public static setTTL = this.cache.setTTL;

  /**
   * Clears the {@link TeeSkin6.cache}.
   */
  public static clearCache = this.cache.clearCache;

  //#endregion

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
      skinResource: options.skinResource ?? 'default',
      skinDbUrl: options.skinDbUrl ?? `https://skins.scrumplex.net/skin/`
    };

    if (typeof this.opts.skinResource === 'string') {
      this.ogFileBuf = Buffer.from([]);
    } else this.ogFileBuf = this.opts.skinResource;
  }

  /**
   * Populate {@link ogFileBuf} with the skin file buffer.
   *
   * If using local custom skin, it won't do anything. Otherwise it will fetch the skin and store the response buffer.
   */
  private async populateBuffer(
    /**
     * Wether to bypass the cache when fetching.
     */
    force = false
  ): Promise<void> {
    if (typeof this.opts.skinResource !== 'string') return;

    const url = `${this.opts.skinDbUrl}${encodeURIComponent(this.opts.skinResource)}.png`;

    if (!force) {
      if (await TeeSkin6.cache.has(url)) {
        const data = await TeeSkin6.cache.get(url);

        if (data) {
          this.ogFileBuf = Buffer.from(data);
          return;
        }
      }
    }

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

    await TeeSkin6.cache.set(url, response.data);

    this.ogFileBuf = buf;
  }

  /**
   * Renders a tee image.
   */
  public async render(
    /**
     * Render options to use.
     */
    options: TeeSkinRenderOptions = {}
  ): Promise<Buffer> {
    const opts: DeepRequired<TeeSkinRenderOptions> = {
      customColors: {
        bodyTWcode: options.customColors?.bodyTWcode ?? null,
        feetTWcode: options.customColors?.feetTWcode ?? null,
        decorationTWcode: null,
        eyesTWcode: null,
        markingTWcode: null
      },
      eyeVariant: options.eyeVariant ?? 'eye-default',
      saveFilePath: options.saveFilePath ?? null,
      size: options.size ?? 96
    };

    await this.populateBuffer();

    const skinFileBuf: Buffer = this.ogFileBuf;

    const skinFileSize = await getImgSize(skinFileBuf);

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

    const meta: Record<TeeSkin6Component, [number, number, number, number, number]> = {
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

    let [bodyOutput, bodyShadowOutput, feetOutput, feetShadowOutput, eyeOutput] = await Promise.all([
      scaleImage(await cropImage(resizedBuf, meta['body'][0], meta['body'][1], meta['body'][2], meta['body'][3]), meta['body'][4]),
      scaleImage(await cropImage(resizedBuf, meta['bodyShadow'][0], meta['bodyShadow'][1], meta['bodyShadow'][2], meta['bodyShadow'][3]), meta['bodyShadow'][4]),
      scaleImage(await cropImage(resizedBuf, meta['feet'][0], meta['feet'][1], meta['feet'][2], meta['feet'][3]), meta['feet'][4]),
      scaleImage(await cropImage(resizedBuf, meta['feetShadow'][0], meta['feetShadow'][1], meta['feetShadow'][2], meta['feetShadow'][3]), meta['feetShadow'][4]),
      scaleImage(await cropImage(resizedBuf, selectedEyesMeta[0], selectedEyesMeta[1], selectedEyesMeta[2], selectedEyesMeta[3]), selectedEyesMeta[4])
    ]);

    let [bodyBuf, bodyShadowBuf, feetBuf, feetShadowBuf, eyeBuf] = [bodyOutput.data, bodyShadowOutput.data, feetOutput.data, feetShadowOutput.data, eyeOutput.data];

    if (opts.customColors.bodyTWcode !== null && opts.customColors.feetTWcode !== null) {
      const [bodyBufColored, bodyShadowBufColored, eyeBufColored, feetBufColored, feetShadowBufColored] = await Promise.all([colorImage(bodyBuf, HSLAfromTWcode(opts.customColors.bodyTWcode), true), colorImage(bodyShadowBuf, HSLAfromTWcode(opts.customColors.bodyTWcode), true), colorImage(eyeBuf, HSLAfromTWcode(opts.customColors.bodyTWcode)), colorImage(feetBuf, HSLAfromTWcode(opts.customColors.feetTWcode)), colorImage(feetShadowBuf, HSLAfromTWcode(opts.customColors.feetTWcode))]);

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
          input: await flipImage(eyeBuf),
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
}
