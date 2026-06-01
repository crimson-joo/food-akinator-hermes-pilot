import type { AnswerKey } from '../../engine/domain.js';
import type { CharacterAssetManifest } from './characterAssetManifest.js';
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

const requiredRuntimeInputs = ['cue', 'answerReaction', 'confidence', 'reducedMotion'] as const;

export function selectCharacterRuntime(manifest: CharacterAssetManifest = characterAssetManifest): CharacterRuntimeAdapter {
  const rive = manifest.runtimes.rive;
  if (rive?.status === 'available') {
    if (isValidRiveRuntime(rive)) return createRiveRuntime(rive);
    return createCssFallbackRuntime({ status: 'failed', attemptedRuntime: 'rive', reason: 'rive-manifest-malformed' });
  }

  const lottie = manifest.runtimes.lottie;
  if (lottie?.status === 'available') {
    if (isValidLottieRuntime(lottie)) return createLottieRuntime(lottie);
    return createCssFallbackRuntime({ status: 'failed', attemptedRuntime: 'lottie', reason: 'lottie-manifest-malformed' });
  }

  return createCssFallbackRuntime({ status: 'fallback', attemptedRuntime: 'rive', reason: 'rive-asset-missing' });
}

export function renderCharacterRuntime(input: CharacterStageInput, manifest: CharacterAssetManifest = characterAssetManifest): string {
  return selectCharacterRuntime(manifest).render(input);
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
  const clips = Object.values(runtime.clips).filter(Boolean);
  return clips.length > 0 && clips.every((src) => src!.startsWith('/assets/') && src!.endsWith('.json'));
}

function createRiveRuntime(runtime: RiveRuntime): CharacterRuntimeAdapter {
  return {
    kind: 'rive',
    status: 'ready',
    supports: (input) => Boolean(input.cue),
    render: (input) => `<div class="rive-character-host" aria-hidden="true" data-character-runtime="rive" data-runtime-status="ready" data-rive-src="${escapeAttr(runtime.src)}" data-rive-state-machine="${escapeAttr(runtime.stateMachineName)}" data-rive-input-cue="${escapeAttr(input.cue)}" data-rive-input-answer-reaction="${escapeAttr(input.lastAnswer ?? 'none')}" data-rive-input-confidence="${input.confidence ?? 'mid'}" data-rive-input-reduced-motion="${input.reducedMotion ? 'true' : 'false'}"></div>`,
  };
}

function createLottieRuntime(runtime: LottieRuntime): CharacterRuntimeAdapter {
  return {
    kind: 'lottie',
    status: 'ready',
    supports: (input) => Boolean(resolveLottieClip(runtime, input.cue)),
    render: (input) => {
      const clip = resolveLottieClip(runtime, input.cue)!;
      const fallbackClipName = runtime.clips.idle ? 'idle' : Object.keys(runtime.clips).find((key) => runtime.clips[key])!;
      return `<div class="lottie-character-host" aria-hidden="true" data-character-runtime="lottie" data-runtime-status="ready" data-lottie-clip-src="${escapeAttr(clip)}" data-lottie-fallback-clip="${escapeAttr(fallbackClipName)}" data-character-cue="${escapeAttr(input.cue)}" data-answer-reaction="${escapeAttr(input.lastAnswer ?? 'none')}"></div>`;
    },
  };
}

function resolveLottieClip(runtime: LottieRuntime, cue: string): string | undefined {
  return runtime.clips[cue] ?? runtime.clips.idle ?? Object.values(runtime.clips).find(Boolean);
}

function createCssFallbackRuntime(meta: CharacterRuntimeRenderMeta): CharacterRuntimeAdapter {
  return {
    kind: 'css-fallback',
    ...meta,
    supports: () => true,
    render: (input) => renderCssFallbackRuntime(input, 'css-fallback', meta),
  };
}

function escapeAttr(value: string): string {
  return value.replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]!);
}
