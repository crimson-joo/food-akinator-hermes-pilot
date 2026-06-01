import type { AnswerKey } from '../../engine/domain.js';
import type { CharacterAssetManifest, LottieAsset } from './characterAssetManifest.js';
import { characterAssetManifest } from './characterAssetManifest.js';
import { renderCssFallbackRuntime } from './cssFallbackRuntime.js';

export type CharacterRuntimeKind = 'rive' | 'lottie' | 'css-fallback';
export type CharacterRuntimeStatus = 'ready' | 'fallback' | 'failed';

export type CharacterStageInput = {
  cue: string;
  lastAnswer?: AnswerKey;
  reducedMotion?: boolean;
  confidence?: 'low' | 'mid' | 'high';
};

export type CharacterRuntimeRenderMeta = {
  status: CharacterRuntimeStatus;
  attemptedRuntime?: CharacterRuntimeKind;
  reason?: string;
};

export type CharacterRuntimeAdapter = CharacterRuntimeRenderMeta & {
  kind: CharacterRuntimeKind;
  supports(input: CharacterStageInput): boolean;
  render(input: CharacterStageInput): string;
};

export type CharacterRuntimeAssetLoader = {
  canLoad(src: string, kind: Exclude<CharacterRuntimeKind, 'css-fallback'>): boolean;
};

export type CharacterLottieRenderer = {
  canRender(asset: LottieAsset): boolean;
  render(asset: LottieAsset, layerContract: string): string;
};

export type CharacterRuntimeSelectionOptions = {
  assetLoader?: CharacterRuntimeAssetLoader;
  lottieRenderer?: CharacterLottieRenderer;
};

const requiredRuntimeInputs = ['cue', 'answerReaction', 'confidence', 'reducedMotion'] as const;

export function selectCharacterRuntime(
  manifest: CharacterAssetManifest = characterAssetManifest,
  options: CharacterRuntimeSelectionOptions = {},
): CharacterRuntimeAdapter {
  const rive = manifest.runtimes.rive;
  if (rive?.status === 'available') {
    if (isValidRiveRuntime(rive)) {
      if (isLoadableAsset(rive.src, 'rive', options)) return createRiveRuntime(rive);
      return createCssFallbackRuntime({ status: 'failed', attemptedRuntime: 'rive', reason: 'rive-asset-load-failed' });
    }
    return createCssFallbackRuntime({ status: 'failed', attemptedRuntime: 'rive', reason: 'rive-manifest-malformed' });
  }

  const lottie = manifest.runtimes.lottie;
  if (lottie?.status === 'available') {
    if (isValidLottieRuntime(lottie)) {
      if (lottie.asset) {
        const poster = renderLottiePosterSafely(lottie, options);
        if (poster) return createLottieRuntime(lottie, options, poster);
        return createCssFallbackRuntime({ status: 'failed', attemptedRuntime: 'lottie', reason: 'lottie-render-failed' });
      }
      if (isLoadableLottieRuntime(lottie, options)) return createLottieRuntime(lottie, options);
      return createCssFallbackRuntime({ status: 'failed', attemptedRuntime: 'lottie', reason: 'lottie-asset-load-failed' });
    }
    return createCssFallbackRuntime({ status: 'failed', attemptedRuntime: 'lottie', reason: 'lottie-manifest-malformed' });
  }

  return createCssFallbackRuntime({ status: 'fallback', attemptedRuntime: 'rive', reason: 'rive-asset-missing' });
}

export function renderCharacterRuntime(
  input: CharacterStageInput,
  manifest: CharacterAssetManifest = characterAssetManifest,
  options: CharacterRuntimeSelectionOptions = {},
): string {
  return selectCharacterRuntime(manifest, options).render(input);
}

type RiveRuntime = NonNullable<CharacterAssetManifest['runtimes']['rive']>;
type LottieRuntime = NonNullable<CharacterAssetManifest['runtimes']['lottie']>;

function isValidRiveRuntime(runtime: RiveRuntime): boolean {
  return runtime.src.startsWith('/assets/')
    && runtime.src.endsWith('.riv')
    && runtime.stateMachineName.trim().length > 0
    && requiredRuntimeInputs.every((input) => runtime.inputs.includes(input));
}

function isValidLottieRuntime(runtime: LottieRuntime): boolean {
  if (runtime.asset) {
    if (!isLottieAssetRenderable(runtime.asset)) return false;
    const asset = runtime.asset;
    const layerNames = new Set(asset.layers!.map((layer) => layer.nm));
    const markerNames = new Set(asset.markers!.map((marker) => marker.cm));
    const markerByCue = runtime.markerByCue ?? {};
    const requiredLayers = runtime.requiredLayers ?? [];
    const requiredMarkers = Object.values(markerByCue).filter((marker): marker is string => isNonEmptyString(marker));
    return Boolean(runtime.src?.endsWith('.lottie.json'))
      && runtime.asset.v.startsWith('5.')
      && runtime.asset.fr >= 24
      && runtime.asset.w === 320
      && runtime.asset.h === 360
      && runtime.asset.op > runtime.asset.ip
      && requiredMarkers.length >= 6
      && requiredMarkers.every((marker) => markerNames.has(marker))
      && requiredLayers.length >= 30
      && requiredLayers.every((layer) => layerNames.has(layer))
      && isNonEmptyString(runtime.layerContract);
  }

  const clipsByCue = runtime.clips ?? {};
  const clips = Object.values(clipsByCue).filter((src): src is string => isNonEmptyString(src));
  return clips.length > 0 && clips.every((src) => src.startsWith('/assets/') && src.endsWith('.json'));
}

function isLoadableLottieRuntime(runtime: LottieRuntime, options: CharacterRuntimeSelectionOptions): boolean {
  const clipsByCue = runtime.clips ?? {};
  return Object.values(clipsByCue)
    .filter((src): src is string => Boolean(src))
    .every((src) => isLoadableAsset(src, 'lottie', options));
}

function isLoadableAsset(
  src: string,
  kind: Exclude<CharacterRuntimeKind, 'css-fallback'>,
  options: CharacterRuntimeSelectionOptions,
): boolean {
  return options.assetLoader?.canLoad(src, kind) === true;
}

function createRiveRuntime(runtime: RiveRuntime): CharacterRuntimeAdapter {
  return {
    kind: 'rive',
    status: 'ready',
    supports: (input) => Boolean(input.cue),
    render: (input) => `<div class="rive-character-host" aria-hidden="true" data-character-runtime="rive" data-runtime-status="ready" data-rive-src="${escapeAttr(runtime.src)}" data-rive-state-machine="${escapeAttr(runtime.stateMachineName)}" data-rive-input-cue="${escapeAttr(input.cue)}" data-rive-input-answer-reaction="${escapeAttr(input.lastAnswer ?? 'none')}" data-rive-input-confidence="${input.confidence ?? 'mid'}" data-rive-input-reduced-motion="${input.reducedMotion ? 'true' : 'false'}"></div>`,
  };
}

function createLottieRuntime(
  runtime: LottieRuntime,
  options: CharacterRuntimeSelectionOptions = {},
  renderedPoster?: string,
): CharacterRuntimeAdapter {
  return {
    kind: 'lottie',
    status: 'ready',
    attemptedRuntime: 'lottie',
    reason: runtime.asset ? 'lottie-asset-rendered' : 'lottie-asset-loaded',
    supports: (input) => Boolean(resolveLottieMarker(runtime, input.cue) || resolveLottieClip(runtime, input.cue)),
    render: (input) => {
      if (runtime.asset) {
        const marker = resolveLottieMarker(runtime, input.cue);
        const poster = renderedPoster ?? renderLottiePosterSafely(runtime, options);
        if (!poster) {
          return renderCssFallbackRuntime(input, 'css-fallback', {
            status: 'failed',
            attemptedRuntime: 'lottie',
            reason: 'lottie-render-failed',
          });
        }
        return `<div class="lottie-character-host" style="width:min(350px,82vw);max-width:100%;height:auto;" aria-label="입맛 탐정 보글 애니메이션" data-character-runtime="lottie" data-runtime-status="ready" data-runtime-attempted="lottie" data-runtime-reason="lottie-asset-rendered" data-lottie-src="${escapeAttr(runtime.src!)}" data-lottie-marker="${escapeAttr(marker)}" data-lottie-rendered="true" data-lottie-layer-contract="${escapeAttr(runtime.layerContract!)}" data-character-cue="${escapeAttr(input.cue)}" data-answer-reaction="${escapeAttr(input.lastAnswer ?? 'none')}" data-lottie-confidence="${input.confidence ?? 'mid'}" data-lottie-reduced-motion="${input.reducedMotion ? 'true' : 'false'}">${poster}</div>`;
      }

      const clip = resolveLottieClip(runtime, input.cue)!;
      const fallbackClipName = runtime.clips?.idle ? 'idle' : Object.keys(runtime.clips ?? {}).find((key) => runtime.clips?.[key])!;
      return `<div class="lottie-character-host" aria-hidden="true" data-character-runtime="lottie" data-runtime-status="ready" data-lottie-clip-src="${escapeAttr(clip)}" data-lottie-fallback-clip="${escapeAttr(fallbackClipName)}" data-character-cue="${escapeAttr(input.cue)}" data-answer-reaction="${escapeAttr(input.lastAnswer ?? 'none')}"></div>`;
    },
  };
}

function resolveLottieMarker(runtime: LottieRuntime, cue: string): string {
  return runtime.markerByCue?.[cue] ?? runtime.markerByCue?.idle ?? 'idle-life-v2';
}

function renderLottiePosterSafely(runtime: LottieRuntime, options: CharacterRuntimeSelectionOptions): string | undefined {
  if (!runtime.asset || !runtime.layerContract) return undefined;
  try {
    if (options.lottieRenderer?.canRender(runtime.asset) === false) return undefined;
    const poster = options.lottieRenderer?.render(runtime.asset, runtime.layerContract)
      ?? renderLottiePoster(runtime.asset, runtime.layerContract);
    return poster.trim().length > 0 ? poster : undefined;
  } catch {
    return undefined;
  }
}

function renderLottiePoster(asset: LottieAsset, layerContract: string): string {
  const layers = asset.layers ?? [];
  const layerNames = layers.map((layer) => layer.nm).join(',');
  const renderedLayers = layers.map(renderLottieLayer).join('');
  return `<svg class="lottie-vector-poster" style="display:block;width:100%;height:auto;max-width:100%;" viewBox="0 0 ${asset.w} ${asset.h}" role="img" aria-label="보글이 단서를 추리하는 Lottie 벡터 포스터" data-lottie-rendered-svg="true" data-lottie-renderer="inline-lottie-json" data-lottie-layer-count="${layers.length}" data-lottie-layers="${escapeAttr(layerNames)}" data-lottie-layer-contract="${escapeAttr(layerContract)}">${renderedLayers}</svg>`;
}

function renderLottieLayer(layer: NonNullable<LottieAsset['layers']>[number]): string {
  const [x, y] = resolveLottiePoint(layer.ks?.p?.k, [0, 0]);
  const [scaleX, scaleY] = resolveLottiePoint(layer.ks?.s?.k, [100, 100]);
  const shapes = layer.shapes ?? [];
  const fill = shapes.find((shape) => shape.ty === 'fl');
  const fillColor = fill?.c?.k ? lottieColorToCss(fill.c.k, fill.o?.k ?? 100) : 'rgba(92,50,29,.24)';
  const primitive = shapes.find((shape) => shape.ty === 'el' || shape.ty === 'rc');
  const [width, height] = resolveLottiePoint(primitive?.s?.k, [24, 24]);
  const [offsetX, offsetY] = resolveLottiePoint(primitive?.p?.k, [0, 0]);
  const shape = primitive?.ty === 'rc'
    ? `<rect x="${formatNumber(offsetX - width / 2)}" y="${formatNumber(offsetY - height / 2)}" width="${formatNumber(width)}" height="${formatNumber(height)}" rx="${formatNumber(Math.min(width, height) * 0.18)}" fill="${escapeAttr(fillColor)}"/>`
    : `<ellipse cx="${formatNumber(offsetX)}" cy="${formatNumber(offsetY)}" rx="${formatNumber(width / 2)}" ry="${formatNumber(height / 2)}" fill="${escapeAttr(fillColor)}"/>`;
  return `<g data-layer-id="${escapeAttr(layer.nm)}" data-lottie-layer-type="${layer.ty}" transform="translate(${formatNumber(x)} ${formatNumber(y)}) scale(${formatNumber(scaleX / 100)} ${formatNumber(scaleY / 100)})">${shape}</g>`;
}

function resolveLottiePoint(value: number[] | Array<{ s?: number[] }> | undefined, fallback: [number, number]): [number, number] {
  const point: readonly unknown[] | undefined = Array.isArray(value) && typeof value[0] === 'object' ? value[0]?.s : value;
  const x = point?.[0];
  const y = point?.[1];
  return [typeof x === 'number' && Number.isFinite(x) ? x : fallback[0], typeof y === 'number' && Number.isFinite(y) ? y : fallback[1]];
}

function lottieColorToCss(color: number[], opacity: number): string {
  const [red = 0, green = 0, blue = 0, alpha = 1] = color;
  const cssAlpha = Math.max(0, Math.min(1, alpha * (opacity / 100)));
  return `rgba(${Math.round(red * 255)},${Math.round(green * 255)},${Math.round(blue * 255)},${formatNumber(cssAlpha)})`;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
}

function resolveLottieClip(runtime: LottieRuntime, cue: string): string | undefined {
  return runtime.clips?.[cue] ?? runtime.clips?.idle ?? Object.values(runtime.clips ?? {}).find(Boolean);
}

function createCssFallbackRuntime(meta: CharacterRuntimeRenderMeta): CharacterRuntimeAdapter {
  return {
    kind: 'css-fallback',
    ...meta,
    supports: () => true,
    render: (input) => renderCssFallbackRuntime(input, 'css-fallback', meta),
  };
}

function isLottieAssetRenderable(asset: LottieAsset): boolean {
  return isNonEmptyString(asset.v)
    && Number.isFinite(asset.fr)
    && Number.isFinite(asset.ip)
    && Number.isFinite(asset.op)
    && Number.isFinite(asset.w)
    && Number.isFinite(asset.h)
    && Array.isArray(asset.markers)
    && asset.markers.every((marker) => isNonEmptyString(marker.cm))
    && Array.isArray(asset.layers)
    && asset.layers.every((layer) => isNonEmptyString(layer.nm));
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function escapeAttr(value: string): string {
  return value.replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]!);
}
