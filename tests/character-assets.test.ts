import { describe, expect, it } from 'vitest';
import { canonicalCharacterConcept, characterConcepts, riveLayerBreakdown, riveStateInputs } from '../src/ui/character/characterAssets.js';

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
});
