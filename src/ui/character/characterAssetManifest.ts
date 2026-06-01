import { animationStateMachine, productionLayerSheet, productionRigLayers } from './characterAssets.js';
import type { CharacterRuntimeKind } from './characterRuntime.js';
import bogleConceptALottie from './assets/bogle-concept-a.lottie.json' with { type: 'json' };

export type LottieMarker = { cm: string; tm: number; dr: number };
export type LottieShape = {
  ty: string;
  nm?: string;
  p?: { k?: number[] };
  s?: { k?: number[] };
  c?: { k?: number[] };
  o?: { k?: number };
};
export type LottieLayer = {
  nm: string;
  ty: number;
  ks?: {
    o?: { k?: number | Array<{ t?: number; s?: number[] }> };
    r?: { k?: number | Array<{ t?: number; s?: number[] }> };
    p?: { k?: number[] | Array<{ t?: number; s?: number[] }> };
    s?: { k?: number[] | Array<{ t?: number; s?: number[] }> };
  };
  shapes?: LottieShape[];
};
export type LottieAsset = {
  v: string;
  fr: number;
  ip: number;
  op: number;
  w: number;
  h: number;
  markers?: LottieMarker[];
  layers?: LottieLayer[];
};

export type LottieRuntimeManifest = {
  src?: string;
  markerByCue?: Partial<Record<string, string>>;
  requiredLayers?: readonly string[];
  layerContract?: string;
  asset?: LottieAsset;
  clips?: Partial<Record<string, string>>;
  status: 'missing' | 'available';
};

export type CharacterAssetManifest = {
  version: 'bogle-character-runtime-v1';
  preferredRuntime: Extract<CharacterRuntimeKind, 'rive' | 'lottie'>;
  fallbackRuntime: Extract<CharacterRuntimeKind, 'css-fallback'>;
  runtimes: {
    rive?: { src: string; stateMachineName: string; inputs: readonly string[]; status: 'missing' | 'available' };
    lottie?: LottieRuntimeManifest;
    cssFallback: { assetKind: string; stateMachineVersion: string; status: 'available' };
  };
};

const requiredLottieLayers = productionRigLayers.map((layer) => layer.id);

const markerByCue = {
  idle: animationStateMachine.states.idle.name,
  ask: animationStateMachine.states.ask.name,
  answerAccepted: animationStateMachine.states.answerAccepted.name,
  thinking: animationStateMachine.states.thinking.name,
  confident: animationStateMachine.states.confident.name,
  surprised: animationStateMachine.states.surprised.name,
  recover: animationStateMachine.states.recover.name,
  reveal: animationStateMachine.states.reveal.name,
} as const;

export const characterAssetManifest: CharacterAssetManifest = {
  version: 'bogle-character-runtime-v1',
  preferredRuntime: 'lottie',
  fallbackRuntime: 'css-fallback',
  runtimes: {
    rive: {
      src: 'assets/character/bogle.riv',
      stateMachineName: 'BogleRuntime',
      inputs: animationStateMachine.inputs,
      status: 'missing',
    },
    lottie: {
      src: 'src/ui/character/assets/bogle-concept-a.lottie.json',
      markerByCue,
      requiredLayers: requiredLottieLayers,
      layerContract: 'concept-a-bogle-rig-v1',
      asset: bogleConceptALottie,
      status: 'available',
    },
    cssFallback: {
      assetKind: productionLayerSheet.assetKind,
      stateMachineVersion: animationStateMachine.version,
      status: 'available',
    },
  },
};
