import { describe, expect, it } from 'vitest';
import {
  ANSWER_VALUES,
  QUESTION_ROLES,
  validateCandidate,
  validateQuestion,
  type Candidate,
  type Question,
} from '../src/engine/domain.js';

describe('engine domain validation', () => {
  it('maps the fixed five answers to ordered likelihood values', () => {
    expect(ANSWER_VALUES).toEqual({
      yes: 1,
      probably: 0.5,
      unknown: 0,
      probably_not: -0.5,
      no: -1,
    });

    expect(ANSWER_VALUES.yes).toBeGreaterThan(ANSWER_VALUES.probably);
    expect(ANSWER_VALUES.probably).toBeGreaterThan(ANSWER_VALUES.unknown);
    expect(ANSWER_VALUES.unknown).toBeGreaterThan(ANSWER_VALUES.probably_not);
    expect(ANSWER_VALUES.probably_not).toBeGreaterThan(ANSWER_VALUES.no);
  });

  it('requires question roles that cover split, lock, discriminator, and reveal-check behaviors', () => {
    expect(QUESTION_ROLES).toEqual([
      'broad_split',
      'family_lock',
      'sibling_elimination',
      'signature_discriminator',
      'false_path_guardrail',
      'recovery_disambiguation',
      'reveal_check',
    ]);

    const validQuestion: Question = {
      id: 'q-soup',
      textKo: '따뜻한 국물이 당기나요?',
      axis: 'form',
      role: 'broad_split',
      clarity: 3,
      revealRisk: 0,
      cost: 1,
      status: 'active',
    };

    expect(validateQuestion(validQuestion).success).toBe(true);
    expect(validateQuestion({ ...validQuestion, role: undefined }).success).toBe(false);
    expect(validateQuestion({ ...validQuestion, role: 'generic' }).success).toBe(false);
  });

  it('bounds question clarity and reveal risk to explicit 0..3 levels', () => {
    const question: Question = {
      id: 'q-spicy',
      textKo: '매콤한 게 괜찮나요?',
      axis: 'taste',
      role: 'family_lock',
      clarity: 0,
      revealRisk: 3,
      cost: 1,
      status: 'active',
    };

    expect(validateQuestion(question).success).toBe(true);
    expect(validateQuestion({ ...question, clarity: -1 }).success).toBe(false);
    expect(validateQuestion({ ...question, clarity: 4 }).success).toBe(false);
    expect(validateQuestion({ ...question, revealRisk: -1 }).success).toBe(false);
    expect(validateQuestion({ ...question, revealRisk: 4 }).success).toBe(false);
  });

  it('bounds candidate attributes to -1..1 and requires reveal reason seeds', () => {
    const candidate: Candidate = {
      id: 'kimchi-jjigae',
      nameKo: '김치찌개',
      aliases: ['김찌'],
      category: '찌개',
      tags: ['hot', 'soup', 'spicy'],
      attributes: {
        'q-soup': 1,
        'q-spicy': 0.75,
        'q-fried': -1,
      },
      prior: 1,
      reveal: {
        oneLiner: '오늘은 뜨끈하고 매콤한 김치찌개 쪽으로 기울었어요.',
        reasonSeeds: ['국물 선호', '매콤함 허용'],
      },
      status: 'active',
    };

    expect(validateCandidate(candidate).success).toBe(true);
    expect(validateCandidate({ ...candidate, attributes: { 'q-soup': 1.1 } }).success).toBe(false);
    expect(validateCandidate({ ...candidate, attributes: { 'q-soup': -1.1 } }).success).toBe(false);
    expect(validateCandidate({ ...candidate, reveal: { ...candidate.reveal, reasonSeeds: [] } }).success).toBe(false);
  });
});
