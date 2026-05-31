export type CharacterConceptId = 'concept-a' | 'concept-b' | 'concept-c';

export type CharacterConcept = {
  id: CharacterConceptId;
  path: string;
  role: string;
  score: number;
  verdict: 'canonical' | 'secondary-reference' | 'reference-only';
  strengths: string[];
  risks: string[];
  sha256: string;
};

export const characterConcepts: CharacterConcept[] = [
  {
    id: 'concept-a',
    path: 'docs/current/character-art/bogle-concept-a.png',
    role: 'detective-oracle',
    score: 8.6,
    verdict: 'canonical',
    strengths: ['distinctive detective-oracle silhouette', 'separate spoon/notebook/plate props', 'expressive riggable brows-eyes-mouth'],
    risks: ['slightly anime-boy generic without final Bogle-specific simplification', 'hair mass needs rig simplification'],
    sha256: '3ca540c6bf7fd31f37edce2f789dde3f38109c46e2d577744fe8ccbdac92c912',
  },
  {
    id: 'concept-b',
    path: 'docs/current/character-art/bogle-concept-b.png',
    role: 'chef-investigator',
    score: 8.1,
    verdict: 'secondary-reference',
    strengths: ['strong food readability', 'premium chef-tool density', 'clear mobile costume contrast'],
    risks: ['too chef-forward', 'held plate complicates reveal rigging'],
    sha256: '26c67d3b860f422f8b2ed66646f32f215518f59c0c23eece6cb3d61e5393bc43',
  },
  {
    id: 'concept-c',
    path: 'docs/current/character-art/bogle-concept-c.png',
    role: 'table-spirit scholar',
    score: 7.4,
    verdict: 'reference-only',
    strengths: ['warm folk texture', 'memorable scholar-table spirit tone', 'clear steam language'],
    risks: ['elderly sage narrows host energy', 'big-head proportions risk toy-like regression'],
    sha256: 'cb1e373fb872f0d6b5f9499f2a68855c78306694c3be8587d78dc775a9fc5d00',
  },
];

export const canonicalCharacterConcept = characterConcepts.find((concept) => concept.verdict === 'canonical')!;

export const riveLayerBreakdown = {
  body: ['body_torso', 'cape_left', 'cape_right', 'jacket_front', 'scarf_knot', 'scarf_tail_left', 'scarf_tail_right', 'belt', 'pouch', 'medallion', 'leg_left', 'leg_right', 'shoe_left', 'shoe_right'],
  face: ['head_base', 'ear_left', 'ear_right', 'hair_back_mass', 'hair_front_1', 'hair_front_2', 'hair_front_3', 'steam_hair_curl', 'brow_left', 'brow_right', 'eye_left_white', 'eye_right_white', 'pupil_left', 'pupil_right', 'eyelid_left', 'eyelid_right', 'cheek_left', 'cheek_right', 'mouth_neutral', 'mouth_smile', 'mouth_oops', 'mouth_thinking', 'mouth_reveal'],
  spoonArm: ['arm_spoon_upper', 'arm_spoon_lower', 'hand_spoon', 'spoon_bowl', 'spoon_handle', 'shoulder_right', 'elbow_right', 'wrist_right'],
  noteArm: ['arm_note_upper', 'arm_note_lower', 'hand_note', 'note_cover', 'note_pages', 'note_ink_check', 'shoulder_left', 'elbow_left', 'wrist_left'],
  revealStage: ['plate_base', 'plate_lid', 'lid_knob', 'dish_glow', 'dish_shadow', 'table_shadow'],
  atmosphere: ['steam_1', 'steam_2', 'steam_3', 'spark_1', 'spark_2', 'spark_3', 'rim_light', 'ground_shadow'],
} as const;

export const riveStateInputs = ['cue', 'answerReaction', 'confidence', 'reducedMotion'] as const;
