import { describe, expect, it } from 'vitest';
import { validateCandidate, validateQuestion, type Candidate, type Question } from '../src/engine/domain.js';
import { foodCandidates, foodKnowledgeBase, foodQuestions } from '../src/data/food-knowledge-base.js';

const FORBIDDEN_VISIBLE_MARKERS = /score|probability|top1|top3|attribute|clue:|q-[a-z0-9-]+/i;

function activeQuestions(): Question[] {
  return foodQuestions.filter((question) => question.status === 'active');
}

function activeCandidates(): Candidate[] {
  return foodCandidates.filter((candidate) => candidate.status === 'active');
}

describe('canonical food knowledge base', () => {
  it('passes domain validation for every active question and candidate', () => {
    for (const question of foodKnowledgeBase.questions) {
      expect(validateQuestion(question), question.id).toEqual({ success: true });
    }
    for (const candidate of foodKnowledgeBase.candidates) {
      expect(validateCandidate(candidate), candidate.id).toEqual({ success: true });
    }
  });

  it('meets the Akinator-level MVP scale gate', () => {
    expect(activeCandidates().length).toBeGreaterThanOrEqual(50);
    expect(activeQuestions().length).toBeGreaterThanOrEqual(35);
  });

  it('keeps every active candidate densely covered by usable active attributes', () => {
    const questionIds = new Set(activeQuestions().map((question) => question.id));
    for (const candidate of activeCandidates()) {
      const coveredAttributes = Object.entries(candidate.attributes).filter(([questionId, value]) => questionIds.has(questionId) && Math.abs(value) > 0.01);
      expect(coveredAttributes.length, `${candidate.nameKo} should have 20+ non-neutral active attributes`).toBeGreaterThanOrEqual(20);
      expect(candidate.reveal.reasonSeeds.length, `${candidate.nameKo} should explain itself with at least 3 reason seeds`).toBeGreaterThanOrEqual(3);
      expect(candidate.reveal.oneLiner).not.toMatch(FORBIDDEN_VISIBLE_MARKERS);
      for (const reason of candidate.reveal.reasonSeeds) {
        expect(reason).not.toMatch(FORBIDDEN_VISIBLE_MARKERS);
      }
    }
  });

  it('keeps each active question discriminating with candidates on both sides', () => {
    for (const question of activeQuestions()) {
      const values = activeCandidates().map((candidate) => candidate.attributes[question.id] ?? 0);
      const positiveCount = values.filter((value) => value > 0.25).length;
      const negativeCount = values.filter((value) => value < -0.25).length;
      const nonNeutralCount = values.filter((value) => Math.abs(value) > 0.25).length;
      expect(nonNeutralCount, `${question.id} should not be mostly neutral`).toBeGreaterThanOrEqual(8);
      expect(positiveCount, `${question.id} needs a yes side`).toBeGreaterThan(0);
      expect(negativeCount, `${question.id} needs a no side`).toBeGreaterThan(0);
    }
  });

  it('covers all question roles needed for adaptive narrowing and recovery', () => {
    const roles = new Set(activeQuestions().map((question) => question.role));
    for (const role of ['broad_split', 'family_lock', 'sibling_elimination', 'signature_discriminator', 'false_path_guardrail', 'recovery_disambiguation']) {
      expect(roles.has(role as Question['role']), `missing role ${role}`).toBe(true);
    }
  });

  it('keeps public demo data out of app-local tiny fixture territory', () => {
    expect(foodKnowledgeBase.candidates.length).toBeGreaterThan(7);
    expect(foodKnowledgeBase.questions.length).toBeGreaterThan(14);
  });
});
