import { describe, expect, it } from 'vitest';
import bogleConceptALottie from '../src/ui/character/assets/bogle-concept-a.lottie.json' with { type: 'json' };
import { animationStateMachine, canonicalCharacterConcept, characterConcepts, productionLayerSheet, productionRigLayers, productionStateActing, riveLayerBreakdown, riveStateInputs } from '../src/ui/character/characterAssets.js';

describe('canonical Bogle source art contract', () => {
  it('keeps three generated concept assets in the repository with integrity metadata', () => {
    expect(characterConcepts).toHaveLength(3);
    for (const concept of characterConcepts) {
      expect(concept.path).toMatch(/^docs\/current\/character-art\/bogle-concept-[abc]\.png$/);
      expect(concept.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(concept.score).toBeGreaterThanOrEqual(7);
      expect(concept.strengths.length).toBeGreaterThanOrEqual(2);
      expect(concept.risks.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('selects concept A as the canonical direction while preserving B/C only as references', () => {
    expect(canonicalCharacterConcept.id).toBe('concept-a');
    expect(canonicalCharacterConcept.role).toBe('detective-oracle');
    expect(canonicalCharacterConcept.verdict).toBe('canonical');
    expect(characterConcepts.find((concept) => concept.id === 'concept-b')?.verdict).toBe('secondary-reference');
    expect(characterConcepts.find((concept) => concept.id === 'concept-c')?.verdict).toBe('reference-only');
  });

  it('defines a Rive-ready layer inventory that covers face acting, two arms, reveal props, and atmosphere', () => {
    expect(riveLayerBreakdown.face).toEqual(expect.arrayContaining(['brow_left', 'brow_right', 'pupil_left', 'pupil_right', 'mouth_smile', 'mouth_oops', 'mouth_reveal']));
    expect(riveLayerBreakdown.spoonArm).toEqual(expect.arrayContaining(['arm_spoon_upper', 'arm_spoon_lower', 'hand_spoon', 'spoon_bowl', 'spoon_handle', 'shoulder_right', 'elbow_right', 'wrist_right']));
    expect(riveLayerBreakdown.noteArm).toEqual(expect.arrayContaining(['arm_note_upper', 'arm_note_lower', 'hand_note', 'note_cover', 'note_ink_check', 'shoulder_left', 'elbow_left', 'wrist_left']));
    expect(riveLayerBreakdown.revealStage).toEqual(expect.arrayContaining(['plate_base', 'plate_lid', 'lid_knob', 'dish_glow']));
    expect(riveLayerBreakdown.atmosphere).toEqual(expect.arrayContaining(['steam_1', 'steam_2', 'steam_3', 'rim_light']));
    expect(riveStateInputs).toEqual(['cue', 'answerReaction', 'confidence', 'reducedMotion']);
  });

  it('locks a production vector layer sheet with art-direction, shading, and mobile readability metadata', () => {
    expect(productionLayerSheet.sourceConceptId).toBe('concept-a');
    expect(productionLayerSheet.assetKind).toBe('brand-vector-layer-sheet');
    expect(productionLayerSheet.qualityBar).toBe('public-beta-minimum');
    expect(productionLayerSheet.nonCopyBoundary).toContain('no Akinator genie silhouette');
    expect(productionLayerSheet.palette.primaryInk).toMatch(/^#/);
    expect(productionLayerSheet.palette.steamHighlight).toMatch(/^#/);
    expect(productionLayerSheet.lineArt.outerStrokePx).toBeGreaterThanOrEqual(3);
    expect(productionLayerSheet.shading).toEqual(expect.arrayContaining(['warm rim light', 'face blush', 'prop specular highlights', 'dish glow bloom']));
    expect(productionLayerSheet.mobileReadability.minViewportPx).toBe(320);
    expect(productionLayerSheet.layerExportGroups).toEqual(expect.arrayContaining(['body', 'face', 'arms', 'props', 'atmosphere']));
  });

  it('defines production part layers as individually addressable puppet pieces rather than flat pose images', () => {
    expect(productionRigLayers.length).toBeGreaterThanOrEqual(34);
    expect(new Set(productionRigLayers.map((layer) => layer.id)).size).toBe(productionRigLayers.length);
    expect(productionRigLayers.every((layer) => layer.vectorRole && layer.pivot && layer.zIndex > 0)).toBe(true);
    expect(productionRigLayers.map((layer) => layer.id)).toEqual(expect.arrayContaining([
      'body_torso',
      'head_base',
      'brow_left',
      'brow_right',
      'eye_left_white',
      'pupil_left',
      'mouth_smile',
      'arm_spoon_upper',
      'arm_spoon_lower',
      'hand_spoon',
      'spoon_bowl',
      'arm_note_upper',
      'arm_note_lower',
      'note_pages',
      'note_ink_check',
      'plate_base',
      'plate_lid',
      'dish_glow',
      'steam_1',
      'spark_1',
    ]));
    expect(productionRigLayers.filter((layer) => layer.group === 'face').length).toBeGreaterThanOrEqual(12);
    expect(productionRigLayers.filter((layer) => layer.group === 'props').length).toBeGreaterThanOrEqual(8);
  });

  it('maps every interactive state to a distinct acting package with emotion, confidence, and layer transforms', () => {
    const requiredStates = ['idle', 'ask', 'answerAccepted', 'thinking', 'confident', 'surprised', 'recover', 'reveal'] as const;
    expect(Object.keys(productionStateActing)).toEqual(expect.arrayContaining([...requiredStates]));
    const fingerprints = new Set<string>();
    for (const state of requiredStates) {
      const acting = productionStateActing[state]!;
      expect(acting.emotion).toMatch(/^[a-z-]+$/);
      expect(acting.thoughtProcessCopy.length).toBeGreaterThan(10);
      expect(acting.visibleSignals.length).toBeGreaterThanOrEqual(3);
      expect(acting.layerTransforms.length).toBeGreaterThanOrEqual(8);
      expect(acting.layerTransforms.map((transform) => transform.layerId)).toEqual(expect.arrayContaining(['head_base', 'brow_left', 'brow_right', 'arm_spoon_lower', 'note_pages', 'plate_lid']));
      fingerprints.add(`${acting.emotion}/${acting.confidenceTone}/${acting.visibleSignals.join('|')}`);
    }
    expect(fingerprints.size).toBe(requiredStates.length);
    expect(productionStateActing.thinking!.visibleSignals).toEqual(expect.arrayContaining(['narrowed eyes', 'note scan line', 'spiraling steam']));
    expect(productionStateActing.recover!.visibleSignals).toEqual(expect.arrayContaining(['calm brows', 'reopened notebook', 'discarded-candidate chip']));
  });

  it('defines a Rive/Lottie-ready animation state machine with multi-step timelines instead of static transforms', () => {
    expect(animationStateMachine.version).toBe('bogle-motion-v2');
    expect(animationStateMachine.inputs).toEqual(['cue', 'answerReaction', 'confidence', 'reducedMotion']);
    expect(Object.keys(animationStateMachine.states)).toEqual(expect.arrayContaining(['idle', 'ask', 'answerAccepted', 'thinking', 'confident', 'surprised', 'recover', 'reveal']));
    for (const [state, clip] of Object.entries(animationStateMachine.states)) {
      expect(clip.name).toMatch(/^[a-z0-9-]+$/);
      expect(clip.durationMs).toBeGreaterThanOrEqual(520);
      expect(clip.durationMs).toBeLessThanOrEqual(1800);
      expect(clip.easing).toMatch(/cubic-bezier|ease/);
      expect(clip.timeline.length, state).toBeGreaterThanOrEqual(3);
      expect(new Set(clip.timeline.map((step) => step.at)).size, state).toBeGreaterThanOrEqual(3);
      expect(clip.timeline.map((step) => step.layerId)).toEqual(expect.arrayContaining(['head_base']));
    }
    expect(animationStateMachine.states.thinking.timeline.map((step) => step.layerId)).toEqual(expect.arrayContaining(['steam_1', 'steam_2', 'note_pages']));
    expect(animationStateMachine.states.reveal.timeline.map((step) => step.layerId)).toEqual(expect.arrayContaining(['plate_lid', 'lid_knob', 'dish_glow', 'spark_1']));
    expect(animationStateMachine.answerReactions.no).toEqual(expect.objectContaining({ clipName: 'prune-swipe', emotionalBeat: 'decisive rejection' }));
    expect(animationStateMachine.answerReactions.unknown).toEqual(expect.objectContaining({ clipName: 'puzzled-shrug', emotionalBeat: 'safe uncertainty' }));
  });
});


describe('authored Concept A Lottie asset contract', () => {
  const asset = bogleConceptALottie as {
    v: string;
    fr: number;
    ip: number;
    op: number;
    w: number;
    h: number;
    markers?: Array<{ cm: string; tm: number; dr: number }>;
    layers?: Array<{ nm: string; ty: number }>;
  };

  it('ships one repo-local Lottie JSON with named reasoning-state markers', () => {
    expect(asset.v).toMatch(/^5\./);
    expect(asset.fr).toBeGreaterThanOrEqual(24);
    expect(asset.w).toBe(320);
    expect(asset.h).toBe(360);
    expect(asset.op).toBeGreaterThan(asset.ip);
    expect(asset.markers?.map((marker) => marker.cm)).toEqual([
      'idle-life-v2',
      'ask-spoon-point-v2',
      'answer-ink-capture-v2',
      'thinking-scan-v2',
      'confidence-lock-v2',
      'oops-recoil-v2',
      'reframe-reset-v2',
      'lid-reveal-payoff-v2',
    ]);
    expect(asset.markers?.every((marker) => marker.dr >= 12)).toBe(true);
  });

  it('preserves stable Concept A rig layer names instead of unrelated pose swaps', () => {
    const layerNames = asset.layers?.map((layer) => layer.nm) ?? [];
    expect(layerNames).toEqual(expect.arrayContaining([
      'body_torso',
      'head_base',
      'brow_left',
      'brow_right',
      'pupil_left',
      'pupil_right',
      'mouth_smile',
      'mouth_oops',
      'mouth_reveal',
      'arm_spoon_lower',
      'spoon_bowl',
      'note_pages',
      'note_ink_check',
      'plate_lid',
      'lid_knob',
      'dish_glow',
      'steam_1',
      'steam_2',
      'spark_1',
    ]));
    expect(new Set(layerNames).size).toBe(layerNames.length);
    expect(layerNames.filter((name) => name.startsWith('pose_'))).toHaveLength(0);
  });

  it('authored marker segments animate body, face, prop, recovery, and reveal layers rather than only steam', () => {
    const layers = new Map((bogleConceptALottie.layers ?? []).map((layer) => [layer.nm, layer]));
    const requiredAnimatedLayers = [
      'body_torso',
      'head_base',
      'brow_left',
      'pupil_left',
      'mouth_thinking',
      'mouth_oops',
      'arm_spoon_lower',
      'spoon_bowl',
      'note_pages',
      'plate_lid',
      'dish_glow',
      'spark_1',
    ];

    for (const layerName of requiredAnimatedLayers) {
      const layer = layers.get(layerName) as { ks?: { p?: { a?: number; k?: unknown[] }; r?: { a?: number; k?: unknown[] }; s?: { a?: number; k?: unknown[] }; o?: { a?: number; k?: unknown[] } } } | undefined;
      expect(layer, layerName).toBeTruthy();
      expect(layer!.ks?.p?.a, `${layerName} position`).toBe(1);
      expect(layer!.ks?.p?.k?.length, `${layerName} position keyframes`).toBe((asset.markers ?? []).length);
      expect(layer!.ks?.r?.a, `${layerName} rotation`).toBe(1);
      expect(layer!.ks?.s?.a, `${layerName} scale`).toBe(1);
      expect(layer!.ks?.o?.a, `${layerName} opacity`).toBe(1);
    }
  });
});
