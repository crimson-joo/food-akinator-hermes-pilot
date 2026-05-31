import { describe, expect, it } from 'vitest';
import { canonicalCharacterConcept, characterConcepts, productionRigLayers, productionStateActing, riveLayerBreakdown, riveStateInputs } from '../src/ui/character/characterAssets.js';

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
});
