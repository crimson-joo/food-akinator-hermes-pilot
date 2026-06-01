import { describe, expect, it } from 'vitest';
import type { Candidate, Question } from '../src/engine/domain.js';
import { rankNextQuestions, selectNextQuestion } from '../src/engine/selector.js';
import type { AnsweredQuestion } from '../src/engine/scoring.js';

function candidate(id: string, attributes: Record<string, number>, status: Candidate['status'] = 'active'): Candidate {
  return {
    id,
    nameKo: id,
    aliases: [],
    category: 'test',
    tags: [],
    attributes,
    prior: 1,
    reveal: { oneLiner: `${id} reveal`, reasonSeeds: ['test seed'] },
    status,
  };
}

function question(
  id: string,
  overrides: Partial<Omit<Question, 'id' | 'textKo' | 'axis' | 'role' | 'clarity' | 'revealRisk' | 'cost' | 'status'>> & Partial<Question> = {},
): Question {
  return {
    id,
    textKo: `${id}?`,
    axis: 'form',
    role: 'family_lock',
    clarity: 1,
    revealRisk: 0,
    cost: 1,
    status: 'active',
    ...overrides,
  };
}

function ids(selections: ReturnType<typeof rankNextQuestions>): string[] {
  return selections.map((selection) => selection.question.id);
}

describe('adaptive question selector', () => {
  it('excludes answered questions and inactive entities before ranking', () => {
    const candidates = [
      candidate('active-soup', { 'q-answered': 1, 'q-active': 1, 'q-disabled-candidate-only': 0 }),
      candidate('active-crispy', { 'q-answered': -1, 'q-active': -1, 'q-disabled-candidate-only': 0 }),
      candidate('disabled-outlier', { 'q-answered': -1, 'q-active': -1, 'q-disabled-candidate-only': 1 }, 'disabled'),
    ];
    const questions = [
      question('q-answered'),
      question('q-active'),
      question('q-draft', { status: 'draft' }),
      question('q-disabled', { status: 'disabled' }),
      question('q-disabled-candidate-only'),
    ];

    const ranked = rankNextQuestions({
      candidates,
      questions,
      answers: [{ questionId: 'q-answered', answer: 'yes' }],
      turn: 2,
    });

    expect(ids(ranked)).toEqual(['q-active', 'q-disabled-candidate-only']);
    expect(ranked.find((selection) => selection.question.id === 'q-disabled-candidate-only')?.score).toBeLessThan(0);
  });

  it('prefers high weighted split while treating missing attributes as neutral', () => {
    const candidates = [
      candidate('soup', { 'q-high-split': 1, 'q-low-split': 0.1 }),
      candidate('crispy', { 'q-high-split': -1 }),
    ];

    const ranked = rankNextQuestions({
      candidates,
      questions: [question('q-low-split'), question('q-high-split')],
      answers: [],
      turn: 4,
    });

    expect(ranked[0]?.question.id).toBe('q-high-split');
  });

  it('applies tiny marginal-cost penalty only across similar-signal questions', () => {
    const candidates = [
      candidate('a', { 'q-low-cost': 1, 'q-high-cost': 1, 'q-strong-split': 1, 'q-weak-cheap': 0.2 }),
      candidate('b', { 'q-low-cost': -1, 'q-high-cost': -1, 'q-strong-split': -1, 'q-weak-cheap': -0.2 }),
    ];

    const nearTie = rankNextQuestions({
      candidates,
      questions: [
        question('q-high-cost', { cost: 4 }),
        question('q-low-cost', { cost: 1 }),
      ],
      answers: [],
      turn: 4,
    });

    const strongSignal = rankNextQuestions({
      candidates,
      questions: [
        question('q-weak-cheap', { cost: 1 }),
        question('q-strong-split', { cost: 4 }),
      ],
      answers: [],
      turn: 4,
    });

    expect(nearTie[0]?.question.id).toBe('q-low-cost');
    expect(strongSignal[0]?.question.id).toBe('q-strong-split');
  });

  it('avoids early reveal-risk when safer alternatives exist but falls back if all are risky', () => {
    const candidates = [
      candidate('kimchi', { 'q-direct': 1, 'q-broad': 0.8, 'q-only-risky': 1 }),
      candidate('chicken', { 'q-direct': -1, 'q-broad': -0.8, 'q-only-risky': -1 }),
    ];

    const selected = selectNextQuestion({
      candidates,
      questions: [
        question('q-direct', { role: 'signature_discriminator', revealRisk: 3, cost: 1 }),
        question('q-broad', { role: 'broad_split', revealRisk: 0, cost: 1 }),
      ],
      answers: [],
      turn: 1,
    });

    const fallback = selectNextQuestion({
      candidates,
      questions: [question('q-only-risky', { role: 'signature_discriminator', revealRisk: 3 })],
      answers: [],
      turn: 1,
    });

    expect(selected?.question.id).toBe('q-broad');
    expect(fallback?.question.id).toBe('q-only-risky');
  });

  it('recovers from unknown by choosing a clear unanswered low-risk question without repetition', () => {
    const candidates = [
      candidate('a', { 'q-start': 1, 'q-clear': 1, 'q-murky': 1 }),
      candidate('b', { 'q-start': -1, 'q-clear': -1, 'q-murky': -1 }),
    ];

    const selected = selectNextQuestion({
      candidates,
      questions: [
        question('q-start', { role: 'broad_split', clarity: 3 }),
        question('q-murky', { clarity: 0, cost: 1 }),
        question('q-clear', { clarity: 3, cost: 1 }),
      ],
      answers: [{ questionId: 'q-start', answer: 'unknown' }],
      turn: 2,
    });

    expect(selected?.question.id).toBe('q-clear');
  });

  it('keeps unknown recovery low-risk after turn 3 when a safer clear question exists', () => {
    const candidates = [
      candidate('a', { 'q-start': 0, 'q-risky': 1, 'q-safe': 0.1 }),
      candidate('b', { 'q-start': 0, 'q-risky': -1, 'q-safe': -0.1 }),
    ];

    const selected = selectNextQuestion({
      candidates,
      questions: [
        question('q-start', { clarity: 3 }),
        question('q-risky', { role: 'signature_discriminator', revealRisk: 3, clarity: 3, cost: 1 }),
        question('q-safe', { role: 'false_path_guardrail', revealRisk: 0, clarity: 3, cost: 1 }),
      ],
      answers: [{ questionId: 'q-start', answer: 'unknown' }],
      turn: 4,
    });

    expect(selected?.question.id).toBe('q-safe');
  });

  it('prefers recovery disambiguation when rejected candidate ids are present', () => {
    const candidates = [
      candidate('a', { 'q-ordinary': 1, 'q-recovery': 1 }),
      candidate('b', { 'q-ordinary': -1, 'q-recovery': -1 }),
    ];

    const selected = selectNextQuestion({
      candidates,
      questions: [
        question('q-ordinary', { role: 'family_lock' }),
        question('q-recovery', { role: 'recovery_disambiguation' }),
      ],
      answers: [],
      turn: 4,
      rejectedCandidateIds: ['rejected-food'],
    });

    expect(selected?.question.id).toBe('q-recovery');
  });

  it('returns no selection when no active candidate or eligible question remains', () => {
    expect(selectNextQuestion({
      candidates: [candidate('disabled', { 'q-any': 1 }, 'disabled')],
      questions: [question('q-any')],
      answers: [],
      turn: 1,
    })).toBeNull();

    expect(rankNextQuestions({
      candidates: [candidate('active', { 'q-any': 1 })],
      questions: [question('q-any')],
      answers: [{ questionId: 'q-any', answer: 'unknown' }],
      turn: 2,
    })).toEqual([]);
  });
});

describe('adaptive selector Korean food scenario pilot', () => {
  const candidates: Candidate[] = [
    candidate('kimchi-jjigae', {
      'q-soup': 1,
      'q-fried': -1,
      'q-spicy': 0.8,
      'q-rice': 0.7,
      'q-red-soup-kimchi': 1,
      'q-hot-clear': 1,
    }),
    candidate('tteokbokki', {
      'q-soup': -0.4,
      'q-fried': -0.6,
      'q-spicy': 1,
      'q-rice': -0.8,
      'q-red-soup-kimchi': -0.2,
      'q-hot-clear': 0.9,
    }),
    candidate('fried-chicken', {
      'q-soup': -1,
      'q-fried': 1,
      'q-spicy': -0.4,
      'q-rice': -1,
      'q-red-soup-kimchi': -1,
      'q-hot-clear': -0.2,
    }),
    candidate('bibimbap', {
      'q-soup': -0.8,
      'q-fried': -0.8,
      'q-spicy': 0.2,
      'q-rice': 1,
      'q-red-soup-kimchi': -1,
      'q-hot-clear': 0.2,
    }),
  ];

  const questions: Question[] = [
    question('q-soup', { role: 'broad_split', clarity: 3, revealRisk: 0, cost: 0 }),
    question('q-fried', { role: 'broad_split', axis: 'cooking', clarity: 3, revealRisk: 0, cost: 1 }),
    question('q-spicy', { role: 'family_lock', axis: 'taste', clarity: 2, revealRisk: 1, cost: 2 }),
    question('q-rice', { role: 'sibling_elimination', clarity: 2, revealRisk: 1, cost: 2 }),
    question('q-red-soup-kimchi', { role: 'signature_discriminator', clarity: 3, revealRisk: 3, cost: 4 }),
    question('q-hot-clear', { role: 'false_path_guardrail', clarity: 3, revealRisk: 0, cost: 1 }),
  ];

  function pick(answers: AnsweredQuestion[], turn: number): string | undefined {
    return selectNextQuestion({ candidates, questions, answers, turn })?.question.id;
  }

  it('starts with a low-risk broad split rather than a direct signature reveal', () => {
    expect(pick([], 1)).toBe('q-soup');
  });

  it('diverges by turn 2-3 after soup yes versus soup no', () => {
    const soupYes = pick([{ questionId: 'q-soup', answer: 'yes' }], 2);
    const soupNo = pick([{ questionId: 'q-soup', answer: 'no' }], 2);

    expect(soupYes).toBeDefined();
    expect(soupNo).toBeDefined();
    expect(soupYes).not.toBe(soupNo);
    expect(['q-spicy', 'q-rice', 'q-hot-clear']).toContain(soupYes);
    expect(soupNo).toBe('q-fried');
  });

  it('does not repeat an unknown first question and recovers to a clear available question', () => {
    expect(pick([{ questionId: 'q-soup', answer: 'unknown' }], 2)).toBe('q-hot-clear');
  });
});
