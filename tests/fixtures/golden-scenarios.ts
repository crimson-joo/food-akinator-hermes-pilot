import type { AnswerKey, Candidate, Question, QuestionRole } from '../../src/engine/domain.js';

export type GoldenScenario = {
  id: string;
  targetCandidateId?: string;
  descriptionKo: string;
  categoryCoverage:
    | 'soup_stew'
    | 'fried_crispy'
    | 'spicy_snack'
    | 'rice_bowl'
    | 'noodle_comfort'
    | 'wrong_recovery'
    | 'all_unknown';
  answers: Record<string, AnswerKey>;
  minDivergenceQuestions: number;
  maxSteps: number;
  rejectFirstGuess?: boolean;
  expectedOutcome:
    | { kind: 'reveal'; candidateId: string; minTurn: number; maxTurn: number; reasonSeedsInclude: string[] }
    | {
      kind: 'recovery';
      rejectedCandidateId: string;
      nextRole: Extract<QuestionRole, 'recovery_disambiguation'>;
      finalCandidateId: string;
      reasonSeedsInclude: string[];
    }
    | { kind: 'exhausted'; reason: 'all-unknown' };
};

function question(id: string, textKo: string, overrides: Partial<Question> = {}): Question {
  return {
    id,
    textKo,
    axis: 'form',
    role: 'family_lock',
    clarity: 2,
    revealRisk: 0,
    cost: 1,
    status: 'active',
    ...overrides,
  };
}

function candidate(
  id: string,
  nameKo: string,
  category: string,
  attributes: Record<string, number>,
  reasonSeeds: string[],
): Candidate {
  return {
    id,
    nameKo,
    aliases: [],
    category,
    tags: [category],
    attributes,
    prior: 1,
    reveal: {
      oneLiner: `${nameKo} 쪽으로 볼게요.`,
      reasonSeeds,
    },
    status: 'active',
  };
}

export const goldenQuestions: Question[] = [
  question('q-broth', '국물이 당기나요?', { role: 'broad_split', axis: 'form', clarity: 3, cost: 0 }),
  question('q-crispy', '바삭하게 씹히는 게 좋나요?', { role: 'broad_split', axis: 'texture', clarity: 3, cost: 0 }),
  question('q-spicy', '매콤한 맛이 오늘 끌리나요?', { role: 'family_lock', axis: 'taste', clarity: 3 }),
  question('q-rice', '밥이 같이 있어야 든든할 것 같나요?', { role: 'family_lock', axis: 'form', clarity: 3 }),
  question('q-noodle', '후루룩 먹는 면이 떠오르나요?', { role: 'family_lock', axis: 'form', clarity: 3 }),
  question('q-snack', '한 끼 식사보다 분식/간식 느낌인가요?', { role: 'family_lock', axis: 'occasion', clarity: 3 }),
  question('q-kimchi', '김치의 새콤하고 빨간 국물이 핵심인가요?', { role: 'signature_discriminator', axis: 'ingredient', clarity: 3, revealRisk: 2 }),
  question('q-soy-earthy', '구수하고 된장 같은 깊은 맛이 더 맞나요?', { role: 'sibling_elimination', axis: 'taste', clarity: 3, revealRisk: 1 }),
  question('q-red-sauce', '빨간 양념이 입에 착 붙는 그림인가요?', { role: 'signature_discriminator', axis: 'visual', clarity: 3, revealRisk: 2 }),
  question('q-mixed-veg', '여러 재료를 비벼 먹는 장면이 떠오르나요?', { role: 'signature_discriminator', axis: 'visual', clarity: 3, revealRisk: 2 }),
  question('q-comfort-hot', '뜨끈하고 편한 위로감이 중요하나요?', { role: 'false_path_guardrail', axis: 'context', clarity: 3, revealRisk: 1 }),
  question('q-delivery-night', '야식/배달 보상감에 가까운가요?', { role: 'sibling_elimination', axis: 'context', clarity: 2, revealRisk: 1 }),
  question('q-recovery-nonkimchi', '그럼 김치찌개는 빼고, 구수한 국물 쪽으로 다시 볼까요?', { role: 'recovery_disambiguation', axis: 'taste', clarity: 3, revealRisk: 0 }),
  question('q-recovery-after-kimchi', '김치찌개를 빼면 된장처럼 구수한 쪽이 더 맞나요?', { role: 'recovery_disambiguation', axis: 'taste', clarity: 3, revealRisk: 0 }),
];

export const goldenCandidates: Candidate[] = [
  candidate('kimchi-jjigae', '김치찌개', 'soup_stew', {
    'q-broth': 1,
    'q-crispy': -1,
    'q-spicy': 0.9,
    'q-rice': 0.8,
    'q-noodle': -1,
    'q-snack': -0.7,
    'q-kimchi': 1,
    'q-soy-earthy': -1,
    'q-red-sauce': 0.8,
    'q-mixed-veg': -0.6,
    'q-comfort-hot': 0.8,
    'q-delivery-night': -0.2,
    'q-recovery-nonkimchi': -1,
    'q-recovery-after-kimchi': -1,
  }, ['국물', '매콤함', '김치 단서']),
  candidate('doenjang-jjigae', '된장찌개', 'soup_stew', {
    'q-broth': 1,
    'q-crispy': -1,
    'q-spicy': -0.8,
    'q-rice': 0.8,
    'q-noodle': -1,
    'q-snack': -0.8,
    'q-kimchi': -1,
    'q-soy-earthy': 1,
    'q-red-sauce': -0.8,
    'q-mixed-veg': -0.4,
    'q-comfort-hot': 0.9,
    'q-delivery-night': -0.5,
    'q-recovery-nonkimchi': 1,
    'q-recovery-after-kimchi': 1,
  }, ['구수한 국물', '밥과 어울림', '뜨끈한 위로감']),
  candidate('fried-chicken', '치킨', 'fried_crispy', {
    'q-broth': -1,
    'q-crispy': 1,
    'q-spicy': -0.1,
    'q-rice': -1,
    'q-noodle': -1,
    'q-snack': 0.2,
    'q-kimchi': -1,
    'q-soy-earthy': -1,
    'q-red-sauce': -0.3,
    'q-mixed-veg': -1,
    'q-comfort-hot': -0.6,
    'q-delivery-night': 1,
    'q-recovery-nonkimchi': -1,
    'q-recovery-after-kimchi': -1,
  }, ['국물 아님', '바삭함', '야식 보상감']),
  candidate('tteokbokki', '떡볶이', 'spicy_snack', {
    'q-broth': -0.6,
    'q-crispy': -0.5,
    'q-spicy': 1,
    'q-rice': -1,
    'q-noodle': -0.4,
    'q-snack': 1,
    'q-kimchi': -0.8,
    'q-soy-earthy': -1,
    'q-red-sauce': 1,
    'q-mixed-veg': -0.7,
    'q-comfort-hot': 0.1,
    'q-delivery-night': 0.4,
    'q-recovery-nonkimchi': -1,
    'q-recovery-after-kimchi': -1,
  }, ['매콤한 양념', '분식 느낌', '빨간 소스']),
  candidate('bibimbap', '비빔밥', 'rice_bowl', {
    'q-broth': -1,
    'q-crispy': -0.7,
    'q-spicy': 0.3,
    'q-rice': 1,
    'q-noodle': -1,
    'q-snack': -0.7,
    'q-kimchi': -0.4,
    'q-soy-earthy': 0.1,
    'q-red-sauce': 0.5,
    'q-mixed-veg': 1,
    'q-comfort-hot': 0.2,
    'q-delivery-night': -0.4,
    'q-recovery-nonkimchi': -0.5,
    'q-recovery-after-kimchi': -0.5,
  }, ['밥 중심', '여러 재료', '비벼 먹는 장면']),
  candidate('ramyeon', '라면', 'noodle_comfort', {
    'q-broth': 0.8,
    'q-crispy': -1,
    'q-spicy': 0.7,
    'q-rice': -0.4,
    'q-noodle': 1,
    'q-snack': 0.1,
    'q-kimchi': -0.2,
    'q-soy-earthy': -0.8,
    'q-red-sauce': 0.6,
    'q-mixed-veg': -0.7,
    'q-comfort-hot': 1,
    'q-delivery-night': 0.5,
    'q-recovery-nonkimchi': -0.8,
    'q-recovery-after-kimchi': -0.8,
  }, ['후루룩 면', '뜨끈한 국물', '편한 위로감']),
  candidate('donkatsu', '돈까스', 'fried_crispy', {
    'q-broth': -1,
    'q-crispy': 0.9,
    'q-spicy': -0.8,
    'q-rice': 0.5,
    'q-noodle': -1,
    'q-snack': -0.4,
    'q-kimchi': -1,
    'q-soy-earthy': -0.7,
    'q-red-sauce': -0.6,
    'q-mixed-veg': -0.2,
    'q-comfort-hot': -0.2,
    'q-delivery-night': 0.1,
    'q-recovery-nonkimchi': -0.7,
    'q-recovery-after-kimchi': -0.7,
  }, ['바삭한 튀김', '밥과 곁들임', '든든한 접시']),
];

export const goldenDataset = {
  candidates: goldenCandidates,
  questions: goldenQuestions,
};

export const goldenScenarios: GoldenScenario[] = [
  {
    id: 'kimchi-jjigae-soup',
    targetCandidateId: 'kimchi-jjigae',
    descriptionKo: '국물·매콤함·김치 단서로 김치찌개를 맞히는 대표 찌개 path',
    categoryCoverage: 'soup_stew',
    answers: {
      'q-broth': 'yes',
      'q-spicy': 'yes',
      'q-rice': 'yes',
      'q-noodle': 'no',
      'q-kimchi': 'yes',
      'q-comfort-hot': 'yes',
      'q-red-sauce': 'yes',
      'q-soy-earthy': 'no',
    },
    minDivergenceQuestions: 5,
    maxSteps: 8,
    expectedOutcome: { kind: 'reveal', candidateId: 'kimchi-jjigae', minTurn: 6, maxTurn: 9, reasonSeedsInclude: ['국물', '김치'] },
  },
  {
    id: 'fried-chicken-crispy',
    targetCandidateId: 'fried-chicken',
    descriptionKo: '국물 no 이후 바삭함·야식 보상감으로 치킨을 맞히는 path',
    categoryCoverage: 'fried_crispy',
    answers: {
      'q-broth': 'no',
      'q-crispy': 'yes',
      'q-rice': 'no',
      'q-delivery-night': 'yes',
      'q-red-sauce': 'no',
      'q-spicy': 'probably_not',
      'q-snack': 'probably',
    },
    minDivergenceQuestions: 5,
    maxSteps: 8,
    expectedOutcome: { kind: 'reveal', candidateId: 'fried-chicken', minTurn: 6, maxTurn: 9, reasonSeedsInclude: ['바삭함'] },
  },
  {
    id: 'tteokbokki-spicy-snack',
    targetCandidateId: 'tteokbokki',
    descriptionKo: '매운 분식과 빨간 양념으로 떡볶이를 맞히는 path',
    categoryCoverage: 'spicy_snack',
    answers: {
      'q-broth': 'probably_not',
      'q-crispy': 'no',
      'q-spicy': 'yes',
      'q-snack': 'yes',
      'q-red-sauce': 'yes',
      'q-rice': 'no',
      'q-noodle': 'probably_not',
    },
    minDivergenceQuestions: 5,
    maxSteps: 8,
    expectedOutcome: { kind: 'reveal', candidateId: 'tteokbokki', minTurn: 6, maxTurn: 9, reasonSeedsInclude: ['분식'] },
  },
  {
    id: 'bibimbap-rice-bowl',
    targetCandidateId: 'bibimbap',
    descriptionKo: '밥 yes·국물 no·여러 재료 단서로 비빔밥을 맞히는 path',
    categoryCoverage: 'rice_bowl',
    answers: {
      'q-broth': 'no',
      'q-crispy': 'no',
      'q-rice': 'yes',
      'q-mixed-veg': 'yes',
      'q-soy-earthy': 'probably_not',
      'q-spicy': 'probably',
      'q-red-sauce': 'probably',
      'q-snack': 'no',
    },
    minDivergenceQuestions: 5,
    maxSteps: 8,
    expectedOutcome: { kind: 'reveal', candidateId: 'bibimbap', minTurn: 6, maxTurn: 9, reasonSeedsInclude: ['밥'] },
  },
  {
    id: 'ramyeon-noodle-comfort',
    targetCandidateId: 'ramyeon',
    descriptionKo: '뜨끈한 국물·면·위로감으로 라면을 맞히는 path',
    categoryCoverage: 'noodle_comfort',
    answers: {
      'q-broth': 'yes',
      'q-noodle': 'yes',
      'q-spicy': 'probably',
      'q-comfort-hot': 'yes',
      'q-rice': 'probably_not',
      'q-kimchi': 'probably_not',
      'q-soy-earthy': 'no',
      'q-red-sauce': 'probably',
      'q-snack': 'unknown',
    },
    minDivergenceQuestions: 5,
    maxSteps: 8,
    expectedOutcome: { kind: 'reveal', candidateId: 'ramyeon', minTurn: 6, maxTurn: 9, reasonSeedsInclude: ['면'] },
  },
  {
    id: 'wrong-guess-recovers-from-kimchi',
    targetCandidateId: 'doenjang-jjigae',
    descriptionKo: '김치찌개 첫 추측을 거절하면 후보를 제외하고 low-risk 회복 질문으로 돌아오는 path',
    categoryCoverage: 'wrong_recovery',
    answers: {
      'q-broth': 'yes',
      'q-spicy': 'yes',
      'q-rice': 'yes',
      'q-noodle': 'no',
      'q-kimchi': 'yes',
      'q-comfort-hot': 'yes',
      'q-red-sauce': 'yes',
      'q-mixed-veg': 'no',
      'q-recovery-nonkimchi': 'no',
      'q-recovery-after-kimchi': 'yes',
      'q-soy-earthy': 'yes',
    },
    minDivergenceQuestions: 5,
    maxSteps: 10,
    rejectFirstGuess: true,
    expectedOutcome: {
      kind: 'recovery',
      rejectedCandidateId: 'kimchi-jjigae',
      nextRole: 'recovery_disambiguation',
      finalCandidateId: 'doenjang-jjigae',
      reasonSeedsInclude: ['구수한 국물'],
    },
  },
  {
    id: 'all-unknown-graceful-fallback',
    descriptionKo: '모든 답변이 모르겠어요이면 반복 없이 graceful fallback으로 종료하는 path',
    categoryCoverage: 'all_unknown',
    answers: {},
    minDivergenceQuestions: 5,
    maxSteps: 5,
    expectedOutcome: { kind: 'exhausted', reason: 'all-unknown' },
  },
];
