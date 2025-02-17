import axios, { AxiosError, AxiosResponse } from 'axios';
import { writeFileSync } from 'fs';
import sharp from 'sharp';
import { DDNetError } from '../../util.js';
import { HSLAfromTWcode, TeeSkinEyeVariant, TeeSkinRenderOptions, tint } from './TeeSkinUtils.js';
import { CacheManager } from '../other/CacheManager.js';

/**
 * All the assets I found in the teeworlds repo under datasrc/skins
 * @internal
 */
export const TeeSkin7AssetTypes = {
  body: ['bat', 'bear', 'beaver', 'dog', 'force', 'fox', 'hippo', 'kitty', 'koala', 'monkey', 'mouse', 'piglet', 'raccoon', 'spiky', 'standard', 'x_ninja'],
  marking: [
    'bear',
    'belly1',
    'belly2',
    'blush',
    'bug',
    'cammo1',
    'cammo2',
    'cammostripes',
    'coonfluff',
    'donny',
    'downdony',
    'duodonny',
    'fox',
    'hipbel',
    'lowcross',
    'lowpaint',
    'marksman',
    'mice',
    'mixture1',
    'mixture2',
    'monkey',
    'panda1',
    'panda2',
    'purelove',
    'saddo',
    'setisu',
    'sidemarks',
    'singu',
    'stripe',
    'striped',
    'stripes',
    'stripes2',
    'thunder',
    'tiger1',
    'tiger2',
    'toptri',
    'triangular',
    'tricircular',
    'tripledon',
    'tritri',
    'twinbelly',
    'twincross',
    'twintri',
    'uppy',
    'warpaint',
    'warstripes',
    'whisker',
    'wildpaint',
    'wildpatch',
    'yinyang'
  ],
  decoration: ['hair', 'twinbopp', 'twinmello', 'twinpen', 'unibop', 'unimelo', 'unipento'],
  feet: ['standard'],
  eyes: ['colorable', 'negative', 'standard', 'standardreal', 'x_ninja']
} as const;

/**
 * 0.7 Skin asset type
 */
export type AssetType = keyof typeof TeeSkin7AssetTypes;

/**
 * 0.7 Skin asset name
 */
export type Asset<T extends AssetType> = (typeof TeeSkin7AssetTypes)[T][number];

/**
 * Util function to assert if a given string is a valid asset name.
 */
export function assertSkinPart<T extends AssetType>(type: T, name?: string): name is Asset<T> {
  const all: Readonly<Asset<T>[]> = TeeSkin7AssetTypes[type];

  return all.includes(name as Asset<T>);
}

/**
 * Options for {@link TeeSkin7}
 */
export interface TeeSkin7Options {
  body?: Asset<'body'>;
  marking?: Asset<'marking'> | null;
  decoration?: Asset<'decoration'> | null;
  feet?: Asset<'feet'>;
  eyes?: Asset<'eyes'>;
}

/**
 * Class used to render TW 0.7 skins (teeworlds).
 */
export class TeeSkin7 {
  //#region Cache

  /**
   * 0.7 Tee Skin part responses cache. (48h default TTL)
   */
  private static cache = new CacheManager<ArrayBuffer>('teeParts7-cache', 48 * 60 * 60 * 1000); // 48h ttl

  /**
   * Sets the TTL (Time-To-Live) for objects in cache.
   */
  public static setTTL = this.cache.setTTL;

  /**
   * Clears the {@link TeeSkin7.cache}.
   */
  public static clearCache = this.cache.clearCache;

  //#endregion

  /**
   * Options for this instance.
   */
  public opts: DeepRequired<TeeSkin7Options>;

  /**
   * Construct a new {@link TeeSkin7} instance.
   */
  constructor(options?: TeeSkin7Options) {
    this.opts = {
      body: options?.body ?? 'standard',
      marking: options?.marking ?? null,
      decoration: options?.decoration ?? null,
      feet: options?.feet ?? 'standard',
      eyes: options?.eyes ?? 'standard'
    };
  }

  /**
   * Renders the tee skin image.
   */
  public async render(
    /**
     * Render options to use.
     */
    options: Omit<TeeSkinRenderOptions, 'eyeVariant'> & {
      eyeVariant?: Exclude<TeeSkinEyeVariant, TeeSkinEyeVariant.dead>;
    } = {}
  ): Promise<Buffer> {
    const opts: DeepRequired<
      Omit<TeeSkinRenderOptions, 'eyeVariant'> & {
        eyeVariant?: Exclude<TeeSkinEyeVariant, TeeSkinEyeVariant.dead>;
      }
    > = {
      customColors: {
        bodyTWcode: options.customColors?.bodyTWcode ?? null,
        markingTWcode: options.customColors?.markingTWcode ?? null,
        decorationTWcode: options.customColors?.decorationTWcode ?? null,
        feetTWcode: options.customColors?.feetTWcode ?? null,
        eyesTWcode: options.customColors?.eyesTWcode ?? null
      },
      eyeVariant: options.eyeVariant ?? TeeSkinEyeVariant.normal,
      saveFilePath: options.saveFilePath ?? null,
      size: options.size ?? 96,
      viewAngle: options.viewAngle ?? 0
    };

    // Fetching all assets
    let [bodyAsset, feetAsset, eyesAsset, markingAsset, decorationAsset] = await Promise.all([
      TeeSkin7.makeRequest('body', this.opts.body),
      TeeSkin7.makeRequest('feet', this.opts.feet),
      TeeSkin7.makeRequest('eyes', this.opts.eyes),
      this.opts.marking ? TeeSkin7.makeRequest('marking', this.opts.marking) : null,
      this.opts.decoration ? TeeSkin7.makeRequest('decoration', this.opts.decoration) : null
    ]);

    // marking/stripes is 171x171 for some reason
    if (this.opts.marking === 'stripes' && markingAsset) {
      markingAsset = await sharp(markingAsset).resize(128, 128).png().toBuffer();
    }

    const eyesCoords: Record<Exclude<(typeof TeeSkinEyeVariant)[keyof typeof TeeSkinEyeVariant], typeof TeeSkinEyeVariant.dead>, sharp.Region> = {
      [TeeSkinEyeVariant.normal]: { left: 0, top: 0, width: 64, height: 32 },
      [TeeSkinEyeVariant.blink]: { left: 0, top: 0, width: 64, height: 32 }, // same as normal
      [TeeSkinEyeVariant.angry]: { left: 64, top: 0, width: 64, height: 32 },
      [TeeSkinEyeVariant.pain]: { left: 0, top: 32, width: 64, height: 32 },
      [TeeSkinEyeVariant.happy]: { left: 64, top: 32, width: 64, height: 32 },
      [TeeSkinEyeVariant.surprise]: { left: 0, top: 64, width: 64, height: 32 }
    };

    // Cropping
    let [bodyBg, bodyColorable, bodyAccent, bodyOutline, footBg, footColorable, selectedEyes, decorationBg, decorationColorable] = await Promise.all([
      sharp(bodyAsset).extract({ left: 0, top: 0, width: 128, height: 128 }).toBuffer(),
      sharp(bodyAsset).extract({ left: 128, top: 0, width: 128, height: 128 }).toBuffer(),
      sharp(bodyAsset).extract({ left: 0, top: 128, width: 128, height: 128 }).toBuffer(),
      sharp(bodyAsset).extract({ left: 128, top: 128, width: 128, height: 128 }).toBuffer(),
      sharp(feetAsset).extract({ left: 64, top: 0, width: 64, height: 64 }).toBuffer(),
      sharp(feetAsset).extract({ left: 0, top: 0, width: 64, height: 64 }).toBuffer(),
      sharp(eyesAsset).extract(eyesCoords[opts.eyeVariant]).toBuffer({ resolveWithObject: true }),
      decorationAsset ? sharp(decorationAsset).extract({ left: 128, top: 0, width: 128, height: 128 }).toBuffer() : null,
      decorationAsset ? sharp(decorationAsset).extract({ left: 0, top: 0, width: 128, height: 128 }).toBuffer() : null
    ]);

    // Blink emote
    if (opts.eyeVariant === TeeSkinEyeVariant.blink) {
      selectedEyes = await sharp(selectedEyes.data)
        .resize(selectedEyes.info.width, Math.round(selectedEyes.info.height * 0.45))
        .toBuffer({ resolveWithObject: true });
    }

    // Coloring
    let [bodyColored, feetColored, eyesColored, markingColored, decorationColored] = await Promise.all([
      opts.customColors.bodyTWcode ? tint(bodyColorable, HSLAfromTWcode(opts.customColors.bodyTWcode), true) : bodyColorable,
      opts.customColors.feetTWcode ? tint(footColorable, HSLAfromTWcode(opts.customColors.feetTWcode), true) : footColorable,
      opts.customColors.eyesTWcode ? tint(selectedEyes.data, HSLAfromTWcode(opts.customColors.eyesTWcode), true) : selectedEyes,
      opts.customColors.markingTWcode && markingAsset ? tint(markingAsset, HSLAfromTWcode(opts.customColors.markingTWcode, true), true) : markingAsset,
      opts.customColors.decorationTWcode && decorationColorable ? tint(decorationColorable, HSLAfromTWcode(opts.customColors.decorationTWcode), true) : decorationColorable
    ]);

    eyesColored = await sharp(eyesColored.data)
      .resize(Math.trunc(eyesColored.info.width * 1.1), Math.trunc(eyesColored.info.height * 1.1))
      .toBuffer({ resolveWithObject: true });

    // Drawing order
    const overlays: sharp.OverlayOptions[] = [{ input: bodyBg }, { input: footBg }];
    if (decorationBg) overlays.push({ input: decorationBg });
    overlays.push({ input: 'data' in feetColored ? feetColored.data : feetColored, left: 18, top: 59 });
    if (decorationColored) overlays.push({ input: 'data' in decorationColored ? decorationColored.data : decorationColored });
    overlays.push({ input: 'data' in bodyColored ? bodyColored.data : bodyColored });
    if (markingColored) overlays.push({ input: 'data' in markingColored ? markingColored.data : markingColored });
    overlays.push({ input: bodyAccent }, { input: bodyOutline }, { input: 'data' in feetColored ? feetColored.data : feetColored, left: 46, top: 59 }, { input: 'data' in eyesColored ? eyesColored.data : eyesColored, left: 44, top: 36 });

    let output = await sharp({
      create: {
        width: 128,
        height: 128,
        background: 'rgba(0, 0, 0, 0)',
        channels: 4
      }
    })
      .composite(overlays)
      .png()
      .toBuffer();

    if (opts.size !== 128) output = await sharp(output).resize(opts.size, opts.size).png().toBuffer();

    if (opts.saveFilePath) writeFileSync(opts.saveFilePath, output);

    return output;
  }

  /**
   * Fetch skin parts and store the response buffer in the cache.
   */
  private static async makeRequest<T extends AssetType>(
    /**
     * The type of the asset.
     */
    type: T,
    /**
     * The name of the asset.
     */
    asset: Asset<T>,
    /**
     * Wether to bypass the cache.
     */
    force = false
  ): Promise<Buffer> {
    const assetUrl = `https://raw.githubusercontent.com/teeworlds/teeworlds/master/datasrc/skins/${type}/${asset}.png`;

    if (!force) {
      if (await this.cache.has(assetUrl)) {
        const data = await this.cache.get(assetUrl);

        if (data) return Buffer.from(data);
      }
    }

    const response = await axios
      .get<ArrayBuffer, AxiosResponse<ArrayBuffer>>(assetUrl, {
        responseType: 'arraybuffer',
        headers: {
          Accept: 'image/png'
        }
      })
      .catch((err: AxiosError) => (err.response?.status === 404 ? new DDNetError(`Asset not found!`, assetUrl) : new DDNetError(err.cause?.message, err)));

    if (response instanceof DDNetError) throw response;
    if (!response.headers['content-type'] || response.headers['content-type'] !== 'image/png') throw new DDNetError('Invalid response type!', response);

    const buf = Buffer.from(response.data);

    await this.cache.set(assetUrl, response.data);

    return buf;
  }
}
