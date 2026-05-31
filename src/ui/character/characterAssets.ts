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

export type ProductionRigLayer = {
  id: string;
  group: 'body' | 'face' | 'arms' | 'props' | 'atmosphere';
  vectorRole: string;
  pivot: string;
  zIndex: number;
};

const layer = (id: string, group: ProductionRigLayer['group'], vectorRole: string, pivot: string, zIndex: number): ProductionRigLayer => ({ id, group, vectorRole, pivot, zIndex });

export const productionRigLayers: ProductionRigLayer[] = [
  layer('ground_shadow', 'atmosphere', 'ground contact shadow', '160 310', 1),
  layer('rim_light', 'atmosphere', 'warm stage rim light', '160 180', 2),
  layer('steam_1', 'atmosphere', 'thought steam strand', '116 70', 3),
  layer('steam_2', 'atmosphere', 'thought steam strand', '162 56', 4),
  layer('steam_3', 'atmosphere', 'thought steam strand', '205 76', 5),
  layer('body_torso', 'body', 'detective torso mass', '160 230', 10),
  layer('cape_left', 'body', 'left cape silhouette', '121 222', 11),
  layer('cape_right', 'body', 'right cape silhouette', '199 222', 12),
  layer('jacket_front', 'body', 'chef detective jacket panels', '160 238', 13),
  layer('scarf_knot', 'body', 'gochugaru scarf knot', '160 183', 14),
  layer('scarf_tail_left', 'body', 'scarf acting tail', '145 190', 15),
  layer('scarf_tail_right', 'body', 'scarf acting tail', '175 190', 16),
  layer('belt', 'body', 'utility belt from concept B', '160 252', 17),
  layer('pouch', 'body', 'chef-tool pouch detail', '132 254', 18),
  layer('medallion', 'body', 'Bogle table medallion', '160 265', 19),
  layer('arm_note_upper', 'arms', 'left upper arm bone', '114 194', 30),
  layer('arm_note_lower', 'arms', 'left lower arm bone', '93 218', 31),
  layer('hand_note', 'arms', 'notebook hand', '77 237', 32),
  layer('note_cover', 'props', 'clue notebook cover', '72 233', 33),
  layer('note_pages', 'props', 'active-clue-scan', '83 234', 34),
  layer('note_ink_check', 'props', 'answer-captured ink check', '97 240', 35),
  layer('arm_spoon_upper', 'arms', 'right upper arm bone', '205 193', 36),
  layer('arm_spoon_lower', 'arms', 'right lower arm bone', '229 214', 37),
  layer('hand_spoon', 'arms', 'spoon hand', '247 232', 38),
  layer('spoon_handle', 'props', 'brass spoon pointer handle', '248 223', 39),
  layer('spoon_bowl', 'props', 'brass spoon pointer bowl', '275 210', 40),
  layer('plate_base', 'props', 'separate reveal plate base', '160 305', 50),
  layer('dish_shadow', 'props', 'dish reveal shadow', '160 298', 51),
  layer('dish_glow', 'props', 'dish answer glow', '160 292', 52),
  layer('plate_lid', 'props', 'liftable cloche lid', '160 274', 53),
  layer('lid_knob', 'props', 'cloche knob', '160 253', 54),
  layer('head_base', 'face', 'head acting base', '160 133', 70),
  layer('ear_left', 'face', 'left ear', '111 137', 71),
  layer('ear_right', 'face', 'right ear', '209 137', 72),
  layer('hair_back_mass', 'face', 'simplified hair mass', '160 88', 73),
  layer('hair_front_1', 'face', 'front hair clump', '132 86', 74),
  layer('hair_front_2', 'face', 'front hair clump', '160 78', 75),
  layer('hair_front_3', 'face', 'front hair clump', '188 88', 76),
  layer('steam_hair_curl', 'face', 'signature steam hair curl', '190 58', 77),
  layer('brow_left', 'face', 'left brow acting control', '139 125', 80),
  layer('brow_right', 'face', 'right brow acting control', '181 125', 81),
  layer('eye_left_white', 'face', 'left eye white', '140 139', 82),
  layer('eye_right_white', 'face', 'right eye white', '180 139', 83),
  layer('pupil_left', 'face', 'left gaze pupil', '141 141', 84),
  layer('pupil_right', 'face', 'right gaze pupil', '179 141', 85),
  layer('eyelid_left', 'face', 'left eyelid blink mask', '140 135', 86),
  layer('eyelid_right', 'face', 'right eyelid blink mask', '180 135', 87),
  layer('cheek_left', 'face', 'left cheek warmth', '126 154', 88),
  layer('cheek_right', 'face', 'right cheek warmth', '194 154', 89),
  layer('mouth_neutral', 'face', 'neutral mouth shape', '160 168', 90),
  layer('mouth_smile', 'face', 'smile mouth shape', '160 168', 91),
  layer('mouth_oops', 'face', 'open oops mouth shape', '160 168', 92),
  layer('mouth_thinking', 'face', 'thinking mouth shape', '160 168', 93),
  layer('mouth_reveal', 'face', 'payoff mouth shape', '160 168', 94),
  layer('spark_1', 'atmosphere', 'payoff spark', '118 100', 100),
  layer('spark_2', 'atmosphere', 'payoff spark', '206 102', 101),
  layer('spark_3', 'atmosphere', 'payoff spark', '160 54', 102),
];

export type ProductionLayerTransform = {
  layerId: string;
  tx: number;
  ty: number;
  rot: number;
  sx?: number;
  sy?: number;
  opacity?: number;
};

export type ProductionStateActing = {
  emotion: string;
  confidenceTone: string;
  thoughtProcessCopy: string;
  visibleSignals: string[];
  layerTransforms: ProductionLayerTransform[];
};

const baseTransforms: ProductionLayerTransform[] = [
  { layerId: 'head_base', tx: 0, ty: 0, rot: 0 },
  { layerId: 'brow_left', tx: 0, ty: 0, rot: 0 },
  { layerId: 'brow_right', tx: 0, ty: 0, rot: 0 },
  { layerId: 'arm_spoon_lower', tx: 0, ty: 0, rot: 0 },
  { layerId: 'note_pages', tx: 0, ty: 0, rot: 0 },
  { layerId: 'plate_lid', tx: 0, ty: 0, rot: 0 },
  { layerId: 'pupil_left', tx: 0, ty: 0, rot: 0 },
  { layerId: 'pupil_right', tx: 0, ty: 0, rot: 0 },
];

const acting = (emotion: string, confidenceTone: string, thoughtProcessCopy: string, visibleSignals: string[], layerTransforms: ProductionLayerTransform[]): ProductionStateActing => ({
  emotion,
  confidenceTone,
  thoughtProcessCopy,
  visibleSignals,
  layerTransforms: [...baseTransforms, ...layerTransforms],
});

export const productionStateActing: Record<string, ProductionStateActing> = {
  idle: acting('warm-ready', 'open-start', '사용자가 마음속 메뉴를 고르는 동안 보글은 숨을 고르고 향을 살피고 있어요.', ['soft breathing', 'slow blink', 'idle steam'], [
    { layerId: 'steam_1', tx: -2, ty: -6, rot: -8, opacity: 0.72 },
    { layerId: 'steam_2', tx: 0, ty: -8, rot: 3, opacity: 0.78 },
    { layerId: 'steam_3', tx: 2, ty: -5, rot: 8, opacity: 0.72 },
  ]),
  ask: acting('curious-detective', 'gathering-first-clues', '질문 카드 쪽으로 몸을 기울이고 국자로 가장 큰 단서를 가리켜요.', ['forward lean', 'spoon point', 'curious brows'], [
    { layerId: 'head_base', tx: 2, ty: -2, rot: -2 },
    { layerId: 'brow_left', tx: -1, ty: -3, rot: -10 },
    { layerId: 'brow_right', tx: 1, ty: -1, rot: 6 },
    { layerId: 'arm_spoon_lower', tx: 12, ty: -11, rot: -22 },
    { layerId: 'spoon_bowl', tx: 18, ty: -13, rot: -18 },
    { layerId: 'note_pages', tx: -2, ty: 2, rot: -4 },
    { layerId: 'plate_lid', tx: 0, ty: 0, rot: 0 },
  ]),
  answerAccepted: acting('clue-captured', 'signal-updated', '방금 받은 답을 메모장에 적고 표정으로 단서의 방향을 알려줘요.', ['ink check', 'small nod', 'focused smile'], [
    { layerId: 'head_base', tx: 0, ty: 3, rot: 1 },
    { layerId: 'brow_left', tx: 0, ty: 1, rot: 2 },
    { layerId: 'brow_right', tx: 0, ty: 1, rot: -2 },
    { layerId: 'arm_note_lower', tx: 11, ty: -8, rot: -16 },
    { layerId: 'note_pages', tx: 12, ty: -9, rot: -9 },
    { layerId: 'note_ink_check', tx: 12, ty: -10, rot: 0, sx: 1.25, sy: 1.25, opacity: 1 },
    { layerId: 'arm_spoon_lower', tx: 2, ty: -2, rot: -4 },
    { layerId: 'plate_lid', tx: 0, ty: 0, rot: 0 },
  ]),
  thinking: acting('deep-analysis', 'blocked-but-working', '단서가 잠깐 엇갈려요. 메모장과 향의 흐름을 다시 맞춰보고 있어요.', ['narrowed eyes', 'note scan line', 'spiraling steam', 'pulled-in shoulders'], [
    { layerId: 'head_base', tx: -2, ty: 6, rot: 4 },
    { layerId: 'brow_left', tx: 1, ty: -4, rot: 12 },
    { layerId: 'brow_right', tx: -1, ty: -4, rot: -12 },
    { layerId: 'pupil_left', tx: 3, ty: 2, rot: 0 },
    { layerId: 'pupil_right', tx: 3, ty: 2, rot: 0 },
    { layerId: 'arm_spoon_lower', tx: -10, ty: 6, rot: 12 },
    { layerId: 'arm_note_lower', tx: 16, ty: -12, rot: -22 },
    { layerId: 'note_pages', tx: 17, ty: -13, rot: -13 },
    { layerId: 'plate_lid', tx: 0, ty: 2, rot: 0, opacity: 0.86 },
    { layerId: 'steam_1', tx: -7, ty: -12, rot: -18, opacity: 1 },
    { layerId: 'steam_2', tx: 4, ty: -15, rot: 16, opacity: 1 },
    { layerId: 'steam_3', tx: 9, ty: -10, rot: 22, opacity: 1 },
  ]),
  confident: acting('evidence-lock', 'nearly-solved', '갈피가 잡혔어요. 접시를 앞으로 밀며 추측 직전의 확신을 보여줘요.', ['plate forward', 'spark eyes', 'upright chest'], [
    { layerId: 'head_base', tx: 0, ty: -4, rot: 0 },
    { layerId: 'brow_left', tx: 0, ty: -3, rot: -4 },
    { layerId: 'brow_right', tx: 0, ty: -3, rot: 4 },
    { layerId: 'arm_spoon_lower', tx: 8, ty: -8, rot: -10 },
    { layerId: 'note_pages', tx: -5, ty: 3, rot: -4 },
    { layerId: 'plate_base', tx: 0, ty: -12, rot: 0, sx: 1.08, sy: 1.08 },
    { layerId: 'plate_lid', tx: 0, ty: -10, rot: 0 },
    { layerId: 'dish_glow', tx: 0, ty: -12, rot: 0, sx: 1.25, sy: 1.25, opacity: 0.85 },
  ]),
  surprised: acting('oops-recoil', 'wrong-turn', '추측이 틀리면 바로 움찔하고 성급함을 인정한 뒤 다시 단서판을 봐요.', ['wide mouth', 'dropped spoon', 'recoil body'], [
    { layerId: 'head_base', tx: -8, ty: 3, rot: -7 },
    { layerId: 'brow_left', tx: -1, ty: -8, rot: -16 },
    { layerId: 'brow_right', tx: 1, ty: -8, rot: 16 },
    { layerId: 'arm_spoon_lower', tx: 19, ty: 19, rot: 34 },
    { layerId: 'spoon_bowl', tx: 18, ty: 20, rot: 35 },
    { layerId: 'note_pages', tx: -5, ty: 6, rot: 11 },
    { layerId: 'plate_lid', tx: -3, ty: 1, rot: -4 },
  ]),
  recover: acting('calm-reframe', 'finding-new-path', '틀린 후보를 제외하고 메모장을 다시 펴며 더 좋은 질문으로 회복해요.', ['calm brows', 'reopened notebook', 'discarded-candidate chip'], [
    { layerId: 'head_base', tx: 1, ty: 2, rot: 1 },
    { layerId: 'brow_left', tx: 0, ty: 2, rot: -2 },
    { layerId: 'brow_right', tx: 0, ty: 2, rot: 2 },
    { layerId: 'arm_spoon_lower', tx: -4, ty: 3, rot: 6 },
    { layerId: 'arm_note_lower', tx: 10, ty: -6, rot: -10 },
    { layerId: 'note_pages', tx: 12, ty: -7, rot: -8, sx: 1.06, sy: 1.06 },
    { layerId: 'plate_lid', tx: 0, ty: 0, rot: 0, opacity: 0.76 },
  ]),
  reveal: acting('payoff-joy', 'solved', '뚜껑을 들어 올리고 빛을 터뜨리며 오늘의 메뉴를 무대처럼 선언해요.', ['lid lift', 'dish glow', 'celebration sparks'], [
    { layerId: 'head_base', tx: 0, ty: -6, rot: 1 },
    { layerId: 'brow_left', tx: 0, ty: -5, rot: -6 },
    { layerId: 'brow_right', tx: 0, ty: -5, rot: 6 },
    { layerId: 'arm_spoon_lower', tx: 6, ty: -18, rot: -24 },
    { layerId: 'note_pages', tx: -6, ty: 2, rot: -4 },
    { layerId: 'plate_base', tx: 0, ty: -8, rot: 0, sx: 1.12, sy: 1.12 },
    { layerId: 'dish_glow', tx: 0, ty: -11, rot: 0, sx: 1.7, sy: 1.7, opacity: 1 },
    { layerId: 'plate_lid', tx: 0, ty: -42, rot: -18 },
    { layerId: 'lid_knob', tx: -3, ty: -43, rot: -18 },
    { layerId: 'spark_1', tx: -5, ty: -10, rot: 18, opacity: 1 },
    { layerId: 'spark_2', tx: 8, ty: -12, rot: -18, opacity: 1 },
    { layerId: 'spark_3', tx: 0, ty: -16, rot: 8, opacity: 1 },
  ]),
};
