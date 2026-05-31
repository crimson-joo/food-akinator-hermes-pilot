import type { AnswerKey } from '../../engine/domain.js';
import type { CharacterAssetManifest } from './characterAssetManifest.js';
import { characterAssetManifest } from './characterAssetManifest.js';
import { renderCssFallbackRuntime } from './cssFallbackRuntime.js';

export type CharacterRuntimeKind = 'rive' | 'lottie' | 'css-fallback';
export type CharacterStageInput = {
  cue: string;
  lastAnswer?: AnswerKey;
  reducedMotion?: boolean;
  confidence?: 'low' | 'mid' | 'high';
};

export type CharacterRuntimeAdapter = {
  kind: CharacterRuntimeKind;
  supports(input: CharacterStageInput): boolean;
  render(input: CharacterStageInput): string;
};

export function selectCharacterRuntime(_manifest: CharacterAssetManifest = characterAssetManifest): CharacterRuntimeAdapter {
  return cssFallbackRuntime;
}

export function renderCharacterRuntime(input: CharacterStageInput, manifest: CharacterAssetManifest = characterAssetManifest): string {
  return selectCharacterRuntime(manifest).render(input);
}

const cssFallbackRuntime: CharacterRuntimeAdapter = {
  kind: 'css-fallback',
  supports: () => true,
  render: (input) => renderCssFallbackRuntime(input),
};
