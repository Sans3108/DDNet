import axios, { AxiosError, AxiosResponse } from 'axios';
import { writeFileSync } from 'fs';
import sharp from 'sharp';
import { DDNetError } from '../../util.js';
import { CacheManager } from '../other/CacheManager.js';
import { Color } from './Color.js';
import { convertToGrayscale, DeepRequired, getImgSize, TeeSkinEyeVariant, TeeSkinRenderOptions, tint } from './TeeSkinUtils.js';

/**
 * Depth 2 {@link DeepRequired}
 *
 * @internal
 */
export type D2Required<T extends object> = Required<{
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
   * 0.6 Tee Skin file responses cache. (48h default TTL)
   */
  private static cache = new CacheManager<ArrayBuffer>('teeSkins6-cache', 48 * 60 * 60 * 1000); // 48h ttl

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
   * Get the skin file buffer.
   */
  public async getSkinFileBuf(
    /**
     * Wether to bypass the cache when fetching.
     */
    force = false
  ): Promise<Buffer> {
    await this.populateBuffer(force);

    return this.ogFileBuf;
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
          Accept: 'image/png'
        }
      })
      .catch((err: AxiosError) => (err.response?.status === 404 ? new DDNetError(`Skin not found! Try changing the \`dbUrl\`.`) : new DDNetError('An error has occurred while fetching the skin!', err)));

    if (response instanceof DDNetError) throw response;

    if (!response.headers['content-type'] || response.headers['content-type'] !== 'image/png') throw new DDNetError('Invalid response type!', response);

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
      eyeVariant: options.eyeVariant ?? TeeSkinEyeVariant.normal,
      saveFilePath: options.saveFilePath ?? null,
      size: options.size ?? 96,
      viewAngle: options.viewAngle ?? 0
    };

    let skinFileBuf = await this.getSkinFileBuf();

    let { width, height } = await getImgSize(skinFileBuf);
    if (width / height !== 2 / 1) throw new DDNetError('Invalid aspect ratio.', { width, height, buf: skinFileBuf });

    // Work with 3x scale to improve acc.
    const mult = 3;

    skinFileBuf = await sharp(skinFileBuf)
      .resize(width * mult, height * mult)
      .toBuffer();

    width *= mult;
    height *= mult;

    // [left, top, width, height]
    const spriteRegions: Record<(typeof TeeSkinEyeVariant)[keyof typeof TeeSkinEyeVariant] | 'body' | 'body-outline' | 'foot' | 'foot-outline', number[]> = {
      'body': [0, 0, width * 0.375, height * 0.75].map(n => Math.round(n)),
      'body-outline': [width * 0.375, 0, width * 0.375, height * 0.75].map(n => Math.round(n)),
      'foot': [width * 0.75, height * 0.25, width * 0.25, height * 0.25].map(n => Math.round(n)),
      'foot-outline': [width * 0.75, height * 0.5, width * 0.25, height * 0.25].map(n => Math.round(n)),
      [TeeSkinEyeVariant.normal]: [width * 0.25, height * 0.75, width * 0.125, height * 0.25].map(n => Math.round(n)),
      [TeeSkinEyeVariant.blink]: [width * 0.25, height * 0.75, width * 0.125, height * 0.25].map(n => Math.round(n)), // same as normal
      [TeeSkinEyeVariant.angry]: [width * 0.375, height * 0.75, width * 0.125, height * 0.25].map(n => Math.round(n)),
      [TeeSkinEyeVariant.pain]: [width * 0.5, height * 0.75, width * 0.125, height * 0.25].map(n => Math.round(n)),
      [TeeSkinEyeVariant.happy]: [width * 0.625, height * 0.75, width * 0.125, height * 0.25].map(n => Math.round(n)),
      [TeeSkinEyeVariant.dead]: [width * 0.75, height * 0.75, width * 0.125, height * 0.25].map(n => Math.round(n)),
      [TeeSkinEyeVariant.surprise]: [width * 0.875, height * 0.75, width * 0.125, height * 0.25].map(n => Math.round(n))
    };

    const selectedEyeVariantRegion: number[] = spriteRegions[opts.eyeVariant];

    const region = (region: number[]): sharp.Region => {
      return { left: region[0], top: region[1], width: region[2], height: region[3] };
    };

    let [body, bodyOutline, foot, footOutline, eye] = await Promise.all([
      sharp(skinFileBuf).extract(region(spriteRegions.body)).toBuffer({ resolveWithObject: true }),
      sharp(skinFileBuf).extract(region(spriteRegions['body-outline'])).toBuffer({ resolveWithObject: true }),
      sharp(skinFileBuf).extract(region(spriteRegions.foot)).toBuffer({ resolveWithObject: true }),
      sharp(skinFileBuf).extract(region(spriteRegions['foot-outline'])).toBuffer({ resolveWithObject: true }),
      sharp(skinFileBuf).extract(region(selectedEyeVariantRegion)).toBuffer({ resolveWithObject: true })
    ]);

    const footScaledWidth = Math.round(foot.info.width * 1.5);
    const footScaledHeight = Math.round(foot.info.height * 1.5);

    const eyeScaledWidth = Math.round(eye.info.width * 1.2);
    const eyeScaledHeight = Math.round(eye.info.height * (opts.eyeVariant === TeeSkinEyeVariant.blink ? 0.45 : 1.2));

    [foot, footOutline, eye] = await Promise.all([
      sharp(foot.data).resize(footScaledWidth, footScaledHeight).toBuffer({ resolveWithObject: true }),
      sharp(footOutline.data).resize(footScaledWidth, footScaledHeight).toBuffer({ resolveWithObject: true }),
      sharp(eye.data).resize(eyeScaledWidth, eyeScaledHeight, { fit: 'fill' }).toBuffer({ resolveWithObject: true })
    ]);

    if (opts.customColors.bodyTWcode !== null && opts.customColors.feetTWcode !== null) {
      // Grayscaling
      // prettier-ignore
      [body, bodyOutline, foot, footOutline, eye] = await Promise.all([
        await convertToGrayscale(body.data, true),
        await convertToGrayscale(bodyOutline.data),
        await convertToGrayscale(foot.data),
        await convertToGrayscale(footOutline.data),
        await convertToGrayscale(eye.data)
      ])

      // Tinting
      const bodyCol = Color.from(opts.customColors.bodyTWcode).to('hsla');
      const feetCol = Color.from(opts.customColors.feetTWcode).to('hsla');

      // prettier-ignore
      [body, bodyOutline, foot, footOutline, eye] = await Promise.all([
        await tint(body.data, bodyCol),
        await tint(bodyOutline.data, bodyCol),
        await tint(foot.data, feetCol),
        await tint(footOutline.data, feetCol),
        await tint(eye.data, bodyCol)
      ]);
    }

    const flippedEye = await sharp(eye.data).flop().toBuffer({ resolveWithObject: true });

    const bodySize = body.info.width;
    const footHeight = foot.info.height;
    const footWidth = foot.info.width;
    const eyeHeight = eye.info.height;
    const eyeWidth = eye.info.width;
    const canvasSize = bodySize * 1.2; // Slight margin of empty space around the tee

    // Amount to shift parts by vertically downwards to center tee
    const centerOffset = (4 / 64) * bodySize;

    const bodyY = (canvasSize - bodySize) / 2; // Body doesn't need shifting
    const bodyX = (canvasSize - bodySize) / 2;

    const footY = (canvasSize - footHeight) / 2 + (10 / 64) * bodySize + centerOffset;
    const lFootX = (canvasSize - footWidth) / 2 - (7 / 64) * bodySize;
    const rFootX = (canvasSize - footWidth) / 2 + (7 / 64) * bodySize;

    let eyeY = (canvasSize - eyeHeight) / 2 - 0.125 * bodySize + centerOffset;
    let lEyeX = (canvasSize - eyeWidth) / 2 - 0.05 * bodySize;
    let rEyeX = (canvasSize - eyeWidth) / 2 + 0.05 * bodySize;

    const dir = opts.viewAngle * (Math.PI / 180);

    const eyeMoveY = Math.sin(dir) * 0.1 * bodySize;
    const eyeMoveX = Math.cos(dir) * 0.125 * bodySize;

    eyeY += eyeMoveY;
    lEyeX += eyeMoveX;
    rEyeX += eyeMoveX;

    const minSeparation = 0.018 * bodySize;
    const maxSeparation = 0.025 * bodySize;

    const separationAmount = Math.pow(Math.abs(Math.sin(dir)), 3) * maxSeparation;

    const eyeSeparation = Math.max(minSeparation, Math.min(separationAmount, maxSeparation));

    lEyeX -= eyeSeparation;
    rEyeX += eyeSeparation;

    const rendered = await sharp({
      create: {
        width: Math.round(canvasSize),
        height: Math.round(canvasSize),
        background: 'rgba(0, 0, 0, 0)',
        channels: 4
      }
    })
      .composite(
        [
          {
            input: bodyOutline.data,
            left: bodyX,
            top: bodyY
          },
          {
            input: footOutline.data,
            left: lFootX,
            top: footY
          },
          {
            input: footOutline.data,
            left: rFootX,
            top: footY
          },
          {
            input: foot.data,
            left: lFootX,
            top: footY
          },
          {
            input: body.data,
            left: bodyX,
            top: bodyY
          },
          {
            input: eye.data,
            left: lEyeX,
            top: eyeY
          },
          {
            input: flippedEye.data,
            left: rEyeX,
            top: eyeY
          },
          {
            input: foot.data,
            left: rFootX,
            top: footY
          }
        ].map(o => ({ input: o.input, left: Math.round(o.left), top: Math.round(o.top) }))
      )
      .png()
      .toBuffer();

    const finalImageBuf = await sharp(rendered).resize(opts.size).png().toBuffer();

    if (opts.saveFilePath) writeFileSync(opts.saveFilePath, finalImageBuf);

    return finalImageBuf;
  }
}
