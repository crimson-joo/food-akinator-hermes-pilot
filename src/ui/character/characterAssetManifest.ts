import { animationStateMachine, productionLayerSheet } from './characterAssets.js';
import type { CharacterRuntimeKind } from './characterRuntime.js';

export type CharacterAssetManifest = {
  version: 'bogle-character-runtime-v1';
  preferredRuntime: Extract<CharacterRuntimeKind, 'rive'>;
  fallbackRuntime: Extract<CharacterRuntimeKind, 'css-fallback'>;
  runtimes: {
    rive?: { src: string; stateMachineName: string; inputs: readonly string[]; status: 'missing' | 'available' };
    lottie?: { clips: Partial<Record<string, string>>; status: 'missing' | 'available' };
    cssFallback: { assetKind: string; stateMachineVersion: string; status: 'available' };
  };
};

export const characterAssetManifest: CharacterAssetManifest = {
  version: 'bogle-character-runtime-v1',
  preferredRuntime: 'rive',
  fallbackRuntime: 'css-fallback',
  runtimes: {
    rive: {
      src: 'assets/character/bogle.riv',
      stateMachineName: 'BogleRuntime',
      inputs: animationStateMachine.inputs,
      status: 'missing',
    },
    lottie: {
      clips: {},
      status: 'missing',
    },
    cssFallback: {
      assetKind: productionLayerSheet.assetKind,
      stateMachineVersion: animationStateMachine.version,
      status: 'available',
    },
  },
};
