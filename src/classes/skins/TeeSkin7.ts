import axios, { AxiosError, AxiosResponse } from 'axios';
import { writeFileSync } from 'fs';
import sharp from 'sharp';
import { DDNetError } from '../../util.js';
import { CacheManager } from '../other/CacheManager.js';
import { DeepRequired, HSLAfromTWcode, TeeSkinEyeVariant, TeeSkinRenderOptions, tint } from './TeeSkinUtils.js';

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
    let [bodyAsset, footAsset, eyesAsset, markingAsset, decorationAsset] = await Promise.all([
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

    const spriteRegions = {
      body: {
        shadow: { top: 0, left: 0, width: 128, height: 128 },
        colorable: { top: 0, left: 128, width: 128, height: 128 },
        accent: { top: 128, left: 0, width: 128, height: 128 },
        outline: { top: 128, left: 128, width: 128, height: 128 }
      },
      decoration: {
        shadow: { top: 0, left: 128, width: 128, height: 128 },
        colorable: { top: 0, left: 0, width: 128, height: 128 }
      },
      foot: {
        shadow: { top: 0, left: 64, width: 64, height: 64 },
        colorable: { top: 0, left: 0, width: 64, height: 64 }
      },
      eyes: {
        [TeeSkinEyeVariant.normal]: { top: 0, left: 0, width: 64, height: 32 },
        [TeeSkinEyeVariant.blink]: { top: 0, left: 0, width: 64, height: 32 }, // same as normal
        [TeeSkinEyeVariant.angry]: { top: 0, left: 64, width: 64, height: 32 },
        [TeeSkinEyeVariant.pain]: { top: 32, left: 0, width: 64, height: 32 },
        [TeeSkinEyeVariant.happy]: { top: 32, left: 64, width: 64, height: 32 },
        [TeeSkinEyeVariant.surprise]: { top: 64, left: 0, width: 64, height: 32 }
      }
    };

    const selectedEyesRegion = spriteRegions.eyes[opts.eyeVariant];

    // Cropping
    let [bodyShadow, bodyColorable, bodyAccent, bodyOutline, footShadow, footColorable, selectedEyes, decorationShadow, decorationColorable, marking] = await Promise.all([
      sharp(bodyAsset).extract(spriteRegions.body.shadow).toBuffer(),
      sharp(bodyAsset).extract(spriteRegions.body.colorable).toBuffer(),
      sharp(bodyAsset).extract(spriteRegions.body.accent).toBuffer(),
      sharp(bodyAsset).extract(spriteRegions.body.outline).toBuffer(),
      sharp(footAsset).extract(spriteRegions.foot.shadow).toBuffer(),
      sharp(footAsset).extract(spriteRegions.foot.colorable).toBuffer(),
      sharp(eyesAsset).extract(selectedEyesRegion).toBuffer(),
      decorationAsset ? sharp(decorationAsset).extract(spriteRegions.decoration.shadow).toBuffer() : null,
      decorationAsset ? sharp(decorationAsset).extract(spriteRegions.decoration.colorable).toBuffer() : null,
      markingAsset
    ]);

    // Blink emote
    if (opts.eyeVariant === TeeSkinEyeVariant.blink) {
      selectedEyes = await sharp(selectedEyes)
        .resize(selectedEyesRegion.width, Math.round(selectedEyesRegion.height * 0.45))
        .toBuffer();
    }

    // Coloring
    [decorationShadow, decorationColorable, bodyColorable, marking, selectedEyes, footColorable] = await Promise.all([
      opts.customColors.decorationTWcode && decorationShadow ? (await tint(decorationShadow, HSLAfromTWcode(opts.customColors.decorationTWcode), true)).data
      : decorationShadow ? decorationShadow
      : null,
      opts.customColors.decorationTWcode && decorationColorable ? (await tint(decorationColorable, HSLAfromTWcode(opts.customColors.decorationTWcode), true)).data
      : decorationColorable ? decorationColorable
      : null,
      opts.customColors.bodyTWcode ? (await tint(bodyColorable, HSLAfromTWcode(opts.customColors.bodyTWcode), true)).data : bodyColorable,
      opts.customColors.markingTWcode && marking ? (await tint(marking, HSLAfromTWcode(opts.customColors.markingTWcode, true), true)).data
      : marking ? marking
      : null,
      opts.customColors.eyesTWcode ? (await tint(selectedEyes, HSLAfromTWcode(opts.customColors.eyesTWcode), true)).data : selectedEyes,
      opts.customColors.feetTWcode ? (await tint(footColorable, HSLAfromTWcode(opts.customColors.feetTWcode), true)).data : footColorable
    ]);

    // Part sizes
    // bodyShadow, bodyColorable, bodyAccent, bodyOutline 128x128
    // footShadow, footColorable 64x64
    // selectedEyes 64x32
    // decorationShadow, decorationColorable, marking 128x128

    const bodySize = spriteRegions.body.shadow.width;
    const footSize = spriteRegions.foot.shadow.width;
    const eyeHeight = opts.eyeVariant === TeeSkinEyeVariant.blink ? Math.round(selectedEyesRegion.height * 0.45) : selectedEyesRegion.height;
    const eyeWidth = selectedEyesRegion.width;
    const canvasSize = bodySize * 1.2; // Slight margin of empty space around the tee

    const centerOffset = (4 / 64) * bodySize;

    const bodyX = (canvasSize - bodySize) / 2;
    const bodyY = (canvasSize - bodySize) / 2;

    const footY = (canvasSize - footSize) / 2 + (10 / 64) * bodySize + centerOffset;
    const lFootX = (canvasSize - footSize) / 2 - (7 / 64) * bodySize;
    const rFootX = (canvasSize - footSize) / 2 + (7 / 64) * bodySize;

    let eyeY = (canvasSize - eyeHeight) / 2 - 0.125 * bodySize + centerOffset;
    let eyeX = (canvasSize - eyeWidth) / 2;

    const dir = opts.viewAngle * (Math.PI / 180);

    const eyeMoveY = Math.sin(dir) * 0.1 * bodySize;
    const eyeMoveX = Math.cos(dir) * 0.125 * bodySize;

    eyeY += eyeMoveY;
    eyeX += eyeMoveX;

    const overlays: sharp.OverlayOptions[] = [
      { input: footShadow, left: lFootX, top: footY }, // back foot
      { input: footShadow, left: rFootX, top: footY }, // front foot
      { input: bodyShadow, left: bodyX, top: bodyY },
      decorationShadow ? { input: decorationShadow, left: bodyX, top: bodyY } : null,
      { input: footColorable, left: lFootX, top: footY }, // back foot
      decorationColorable ? { input: decorationColorable, left: bodyX, top: bodyY } : null,
      { input: bodyColorable, left: bodyX, top: bodyY },
      marking ? { input: marking, left: bodyX, top: bodyY } : null,
      { input: bodyAccent, left: bodyX, top: bodyY },
      { input: bodyOutline, left: bodyX, top: bodyY },
      { input: selectedEyes, left: eyeX, top: eyeY },
      { input: footColorable, left: rFootX, top: footY } // front foot
    ].filter(Boolean) as sharp.OverlayOptions[];

    let output = await sharp({
      create: {
        width: Math.round(canvasSize),
        height: Math.round(canvasSize),
        background: 'rgba(0, 0, 0, 0)',
        channels: 4
      }
    })
      .composite(overlays.map(o => ({ input: o.input, left: o.left ? Math.round(o.left) : undefined, top: o.top ? Math.round(o.top) : undefined })))
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
