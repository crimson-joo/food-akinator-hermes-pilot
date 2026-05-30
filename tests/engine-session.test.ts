import { describe, expect, it } from 'vitest';
import type { AnswerKey, Candidate, Question } from '../src/engine/domain.js';
import { startSession, submitAnswer, submitGuessFeedback } from '../src/engine/session.js';

function candidate(id: string, attributes: Record<string, number>, overrides: Partial<Candidate> = {}): Candidate {
  return {
    id,
    nameKo: id,
    aliases: [],
    category: 'test',
    tags: [],
    attributes,
    prior: 1,
    reveal: { oneLiner: `${id} 선언`, reasonSeeds: [`${id} 단서`] },
    status: 'active',
    ...overrides,
  };
}

function question(id: string, overrides: Partial<Question> = {}): Question {
  return {
    id,
    textKo: `${id}?`,
    axis: 'form',
    role: 'family_lock',
    clarity: 2,
    revealRisk: 0,
    cost: 1,
    status: 'active',
    ...overrides,
  };
}

const answerOptions: AnswerKey[] = ['yes', 'probably', 'unknown', 'probably_not', 'no'];

const coreQuestions: Question[] = [
  question('q-broth', { role: 'broad_split', clarity: 3, cost: 0, textKo: '국물이 당기나요?' }),
  question('q-spicy', { role: 'family_lock', clarity: 3, textKo: '매콤한 쪽인가요?' }),
  question('q-rice', { role: 'sibling_elimination', clarity: 2, textKo: '밥이 같이 떠오르나요?' }),
  question('q-kimchi', { role: 'signature_discriminator', clarity: 3, revealRisk: 2, textKo: '김치의 새콤함이 핵심인가요?' }),
  question('q-hot-pot', { role: 'false_path_guardrail', clarity: 2, revealRisk: 1, textKo: '뚝배기처럼 뜨거운 장면인가요?' }),
  question('q-recovery', { role: 'recovery_disambiguation', clarity: 3, revealRisk: 0, textKo: '그럼 맵지 않은 국물 쪽으로 다시 볼까요?' }),
  question('q-risky-direct', { role: 'signature_discriminator', clarity: 3, revealRisk: 3, textKo: '혹시 빨간 김치찌개인가요?' }),
];

const coreCandidates: Candidate[] = [
  candidate('kimchi-jjigae', {
    'q-broth': 1,
    'q-spicy': 1,
    'q-rice': 0.8,
    'q-kimchi': 1,
    'q-hot-pot': 0.8,
    'q-recovery': -0.2,
    'q-risky-direct': 1,
  }, { nameKo: '김치찌개', reveal: { oneLiner: '오늘은 김치찌개예요.', reasonSeeds: ['국물', '매콤함', '김치 단서'] } }),
  candidate('doenjang-jjigae', {
    'q-broth': 1,
    'q-spicy': -0.8,
    'q-rice': 0.8,
    'q-kimchi': -1,
    'q-hot-pot': 0.7,
    'q-recovery': 1,
    'q-risky-direct': -1,
  }, { nameKo: '된장찌개', reveal: { oneLiner: '오늘은 된장찌개 쪽이에요.', reasonSeeds: ['구수한 국물', '밥과 어울림'] } }),
  candidate('fried-chicken', {
    'q-broth': -1,
    'q-spicy': -0.3,
    'q-rice': -1,
    'q-kimchi': -1,
    'q-hot-pot': -1,
    'q-recovery': -0.7,
    'q-risky-direct': -1,
  }, { nameKo: '치킨', reveal: { oneLiner: '오늘은 치킨 쪽이에요.', reasonSeeds: ['국물 아님', '바삭함'] } }),
];

function dataset(candidates = coreCandidates, questions = coreQuestions) {
  return { candidates, questions };
}

function answerCurrent(session: ReturnType<typeof startSession>, answer: AnswerKey, data = dataset()) {
  expect(session.currentQuestion?.id).toBeDefined();
  return submitAnswer(session, { questionId: session.currentQuestion!.id, answer }, data);
}

describe('engine session state machine', () => {
  it('starts in asking state with selected question, fixed answer options, and ask cue', () => {
    const session = startSession(dataset());

    expect(session.status).toBe('asking');
    expect(session.characterCue).toBe('ask');
    expect(session.turn).toBe(1);
    expect(session.currentQuestion?.id).toBe('q-broth');
    expect(session.canAnswer).toBe(true);
    expect(session.answerOptions).toEqual(answerOptions);
  });

  it('submitting an answer appends one answer and chooses a deterministic unanswered next question', () => {
    const session = startSession(dataset());
    const next = submitAnswer(session, { questionId: 'q-broth', answer: 'yes' }, dataset());

    expect(next.answers).toEqual([{ questionId: 'q-broth', answer: 'yes' }]);
    expect(next.currentQuestion?.id).toBeDefined();
    expect(next.currentQuestion?.id).not.toBe('q-broth');
    expect(next.turn).toBe(2);
    expect(['asking', 'confident']).toContain(next.status);
    expect(['ask', 'confident']).toContain(next.characterCue);
  });

  it('does not reveal before minRevealTurn while useful eligible questions remain', () => {
    let session = startSession(dataset());
    for (let index = 0; index < 4; index += 1) {
      session = answerCurrent(session, 'yes');
    }

    expect(session.turn).toBe(5);
    expect(session.status).not.toBe('revealed');
    expect(session.guess).toBeUndefined();
    expect(session.currentQuestion?.id).toBeDefined();
  });

  it('reveals after confidence and margin pass once minRevealTurn is reached', () => {
    let session = startSession(dataset());
    for (let index = 0; index < 5; index += 1) {
      session = answerCurrent(session, 'yes');
    }

    expect(session.status).toBe('revealed');
    expect(session.characterCue).toBe('reveal');
    expect(session.guess?.candidate.id).toBe('kimchi-jjigae');
    expect(session.canConfirmGuess).toBe(true);
    expect(session.canRejectGuess).toBe(true);
    expect(session.copy.headlineKo).toContain('김치찌개');
    expect(session.copy.helperKo).toContain('국물');
    expect(session.copy.helperKo).not.toMatch(/score|probability|q-/i);
  });

  it('uses soft cap reveal only when turn and confidence thresholds are met', () => {
    const questions = Array.from({ length: 11 }, (_, index) => question(`q-soft-${index + 1}`, { role: index === 0 ? 'broad_split' : 'family_lock', revealRisk: 0 }));
    const candidates = [
      candidate('steady-top', Object.fromEntries(questions.map((q) => [q.id, 0.4])), { nameKo: '은근한 1순위' }),
      candidate('runner-up', Object.fromEntries(questions.map((q) => [q.id, -0.1])), { nameKo: '2순위' }),
      candidate('third', Object.fromEntries(questions.map((q) => [q.id, -0.2])), { nameKo: '3순위' }),
    ];
    const data = dataset(candidates, questions);

    let session = startSession(data);
    for (let index = 0; index < 9; index += 1) {
      session = answerCurrent(session, 'probably', data);
    }
    expect(session.status).not.toBe('revealed');

    session = answerCurrent(session, 'probably', data);
    expect(session.status).toBe('revealed');
    expect(session.guess?.candidate.id).toBe('steady-top');
  });

  it('hard cap stops asking, but all-unknown flat evidence terminates exhausted instead of fake reveal', () => {
    const questions = Array.from({ length: 14 }, (_, index) => question(`q-hard-${index + 1}`, { role: index === 0 ? 'broad_split' : 'family_lock', clarity: 3 }));
    const candidates = [
      candidate('a', Object.fromEntries(questions.map((q) => [q.id, 1]))),
      candidate('b', Object.fromEntries(questions.map((q) => [q.id, -1]))),
    ];
    const data = dataset(candidates, questions);

    let session = startSession(data, { maxUnknownBeforeExhausted: 20 });
    for (const _q of questions) {
      session = answerCurrent(session, 'unknown', data);
    }

    expect(session.turn).toBe(15);
    expect(session.status).toBe('exhausted');
    expect(session.characterCue).toBe('exhausted');
    expect(session.guess).toBeUndefined();
    expect(session.copy.headlineKo).toContain('단서');
  });

  it('wrong guess feedback suppresses rejected candidate and asks low-risk recovery question', () => {
    let session = startSession(dataset());
    for (let index = 0; index < 5; index += 1) {
      session = answerCurrent(session, 'yes');
    }
    expect(session.guess?.candidate.id).toBe('kimchi-jjigae');

    const recovered = submitGuessFeedback(session, { candidateId: 'kimchi-jjigae', accepted: false }, dataset());

    expect(recovered.status).toBe('asking');
    expect(recovered.characterCue).toBe('recover');
    expect(recovered.rejectedCandidateIds).toEqual(['kimchi-jjigae']);
    expect(recovered.topCandidate?.id).not.toBe('kimchi-jjigae');
    expect(recovered.currentQuestion?.id).toBe('q-recovery');
    expect(recovered.currentQuestion?.revealRisk).toBeLessThanOrEqual(1);
  });

  it('all-unknown path never repeats questions and terminates gracefully', () => {
    const questions = Array.from({ length: 6 }, (_, index) => question(`q-unknown-${index + 1}`, { role: index === 0 ? 'broad_split' : 'family_lock', clarity: 3 }));
    const candidates = [
      candidate('a', Object.fromEntries(questions.map((q) => [q.id, 1]))),
      candidate('b', Object.fromEntries(questions.map((q) => [q.id, -1]))),
    ];
    const data = dataset(candidates, questions);

    let session = startSession(data);
    const asked = new Set<string>();
    for (let index = 0; index < 5; index += 1) {
      expect(session.currentQuestion?.id).toBeDefined();
      expect(asked.has(session.currentQuestion!.id)).toBe(false);
      asked.add(session.currentQuestion!.id);
      session = answerCurrent(session, 'unknown', data);
    }

    expect(session.status).toBe('exhausted');
    expect(session.characterCue).toBe('exhausted');
    expect(session.answers.map((answer) => answer.answer)).toEqual(['unknown', 'unknown', 'unknown', 'unknown', 'unknown']);
  });

  it('rejects stale and duplicate answer submissions without mutating session state', () => {
    const session = startSession(dataset());
    expect(() => submitAnswer(session, { questionId: 'q-spicy', answer: 'yes' }, dataset())).toThrow(/current question/i);

    const next = submitAnswer(session, { questionId: 'q-broth', answer: 'yes' }, dataset());
    expect(() => submitAnswer(next, { questionId: 'q-broth', answer: 'yes' }, dataset())).toThrow(/already answered/i);
    expect(next.answers).toHaveLength(1);
  });

  it('rejects runtime answer keys outside the fixed five values', () => {
    const session = startSession(dataset());

    expect(() => submitAnswer(
      session,
      { questionId: 'q-broth', answer: 'constructor' as AnswerKey },
      dataset(),
    )).toThrow(/unknown answer key/i);
  });

  it('does not expose a shared mutable answer options array across sessions', () => {
    const first = startSession(dataset());
    first.answerOptions.push('constructor' as AnswerKey);

    const second = startSession(dataset());
    expect(second.answerOptions).toEqual(answerOptions);
  });

  it('exposes character cues for asking, confident progress, reveal, recovery, and exhausted states', () => {
    const asking = startSession(dataset());
    const confident = submitAnswer(asking, { questionId: 'q-broth', answer: 'yes' }, dataset());
    let reveal = confident;
    for (let index = 0; index < 4; index += 1) {
      reveal = answerCurrent(reveal, 'yes');
    }
    const recover = submitGuessFeedback(reveal, { candidateId: 'kimchi-jjigae', accepted: false }, dataset());

    const unknownQuestions = Array.from({ length: 5 }, (_, index) => question(`q-cue-${index + 1}`, { role: index === 0 ? 'broad_split' : 'family_lock', clarity: 3 }));
    const unknownCandidates = [
      candidate('a', Object.fromEntries(unknownQuestions.map((q) => [q.id, 1]))),
      candidate('b', Object.fromEntries(unknownQuestions.map((q) => [q.id, -1]))),
    ];
    const unknownData = dataset(unknownCandidates, unknownQuestions);
    let exhausted = startSession(unknownData);
    for (let index = 0; index < 5; index += 1) {
      exhausted = answerCurrent(exhausted, 'unknown', unknownData);
    }

    expect(asking.characterCue).toBe('ask');
    expect(['ask', 'confident']).toContain(confident.characterCue);
    expect(reveal.characterCue).toBe('reveal');
    expect(recover.characterCue).toBe('recover');
    expect(exhausted.characterCue).toBe('exhausted');
  });
});
