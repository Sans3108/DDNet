import axios, { AxiosError, AxiosResponse } from 'axios';
import { writeFileSync } from 'fs';
import Keyv from 'keyv';
import sharp from 'sharp';
import { DDNetError } from '../../util.js';
import { HSLAfromTWcode, TeeSkinEyeVariant, TeeSkinRenderOptions, colorImage, cropImage, scaleImage } from './TeeSkinUtils.js';
import { CacheManager } from '../other/CacheManager.js';

/**
 * All the assets I found in the teeworlds repo under datasrc/skins
 */
const TeeSkin7AssetTypes = {
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
   * 0.7 Tee Skin part responses cache.
   */
  private static cache = new CacheManager<ArrayBuffer>('teeParts7-cache', 24 * 60 * 60 * 1000); // 24h ttl

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
    options?: TeeSkinRenderOptions
  ): Promise<Buffer> {
    const opts: DeepRequired<TeeSkinRenderOptions> = {
      customColors: {
        bodyTWcode: options?.customColors?.bodyTWcode ?? null,
        markingTWcode: options?.customColors?.markingTWcode ?? null,
        decorationTWcode: options?.customColors?.decorationTWcode ?? null,
        feetTWcode: options?.customColors?.feetTWcode ?? null,
        eyesTWcode: options?.customColors?.eyesTWcode ?? null
      },
      eyeVariant: options?.eyeVariant ?? 'eye-default',
      saveFilePath: options?.saveFilePath ?? null,
      size: options?.size ?? 96
    };

    // Fetching all assets
    let [bodyAsset, feetAsset, eyesAsset, markingAsset, decorationAsset] = await Promise.all([TeeSkin7.makeRequest('body', this.opts.body), TeeSkin7.makeRequest('feet', this.opts.feet), TeeSkin7.makeRequest('eyes', this.opts.eyes), this.opts.marking ? TeeSkin7.makeRequest('marking', this.opts.marking) : null, this.opts.decoration ? TeeSkin7.makeRequest('decoration', this.opts.decoration) : null]);

    // marking/stripes is 171x171 for some reason
    if (this.opts.marking === 'stripes' && markingAsset) {
      markingAsset = await sharp(markingAsset).resize(128, 128).png().toBuffer();
    }

    const eyesCoords: { [key in TeeSkinEyeVariant]: [number, number, number, number] } = {
      'eye-default': [0, 0, 64, 32],
      'eye-evil': [64, 0, 128, 32],
      'eye-hurt': [0, 32, 64, 64],
      'eye-happy': [64, 32, 128, 64],
      'eye-surprised': [0, 64, 64, 96]
    };

    // Cropping
    let [bodyBg, bodyColorable, bodyAccent, bodyOutline, feetBg, feetColorable, selectedEyes, decorationBg, decorationColorable] = await Promise.all([
      cropImage(bodyAsset, 0, 0, 128, 128),
      cropImage(bodyAsset, 128, 0, 256, 128),
      cropImage(bodyAsset, 0, 128, 128, 256),
      cropImage(bodyAsset, 128, 128, 256, 256),
      cropImage(feetAsset, 64, 0, 128, 64),
      cropImage(feetAsset, 0, 0, 64, 64),
      cropImage(eyesAsset, ...eyesCoords[opts.eyeVariant]),
      decorationAsset ? cropImage(decorationAsset, 128, 0, 256, 128) : null,
      decorationAsset ? cropImage(decorationAsset, 0, 0, 128, 128) : null
    ]);

    // Coloring
    let [bodyColored, feetColored, eyesColored, markingColored, decorationColored] = await Promise.all([
      opts.customColors.bodyTWcode ? colorImage(bodyColorable, HSLAfromTWcode(opts.customColors.bodyTWcode)) : bodyColorable,
      opts.customColors.feetTWcode ? colorImage(feetColorable, HSLAfromTWcode(opts.customColors.feetTWcode)) : feetColorable,
      opts.customColors.eyesTWcode ? colorImage(selectedEyes, HSLAfromTWcode(opts.customColors.eyesTWcode)) : selectedEyes,
      opts.customColors.markingTWcode && markingAsset ? colorImage(markingAsset, HSLAfromTWcode(opts.customColors.markingTWcode, true)) : markingAsset,
      opts.customColors.decorationTWcode && decorationColorable ? colorImage(decorationColorable, HSLAfromTWcode(opts.customColors.decorationTWcode)) : decorationColorable
    ]);

    eyesColored = (await scaleImage(eyesColored, 1.1)).data;

    // Drawing order
    const overlays: sharp.OverlayOptions[] = [{ input: bodyBg }, { input: feetBg }];
    if (decorationBg) overlays.push({ input: decorationBg });
    overlays.push({ input: feetColored, left: 18, top: 59 });
    if (decorationColored) overlays.push({ input: decorationColored });
    overlays.push({ input: bodyColored });
    if (markingColored) overlays.push({ input: markingColored });
    overlays.push({ input: bodyAccent }, { input: bodyOutline }, { input: feetColored, left: 46, top: 59 }, { input: eyesColored, left: 44, top: 36 });

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
          'Cache-Control': 'no-cache',
          'Accept': 'image/png'
        }
      })
      .catch((err: AxiosError) => (err.response?.status === 404 ? new DDNetError(`Asset not found!`, assetUrl) : new DDNetError(err.cause?.message, err)));

    if (response instanceof DDNetError) throw response;

    if (!response.headers['content-type']) throw new DDNetError('Invalid response type!', response);
    if (response.headers['content-type'] !== 'image/png') throw new DDNetError('Invalid response type!', response);

    const buf = Buffer.from(response.data);

    await this.cache.set(assetUrl, response.data);

    return buf;
  }
}
