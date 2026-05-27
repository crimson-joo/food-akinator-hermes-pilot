import { describe, expect, it } from 'vitest';
import { FOODS } from '../data/foods';
import { QUESTIONS } from '../data/questions';
import { answerCurrentQuestion, createSession, markGuessWrong, revealReadiness } from './session';

describe('final service acceptance contract', () => {
  it('ships with enough Korean menu/question coverage for replayable sessions', () => {
    expect(FOODS.length).toBeGreaterThanOrEqual(42);
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(45);
    expect(new Set(FOODS.map((food) => food.id)).size).toBe(FOODS.length);
    expect(new Set(QUESTIONS.map((question) => question.id)).size).toBe(QUESTIONS.length);
  });

  it('does not repeat questions and reaches a reveal inside the planned 6-12 turn window', () => {
    let session = createSession();
    const seen = new Set<string>();
    for (let i = 0; i < 12 && session.phase !== 'reveal'; i += 1) {
      expect(session.currentQuestion?.id).toBeTruthy();
      expect(seen.has(session.currentQuestion!.id)).toBe(false);
      seen.add(session.currentQuestion!.id);
      session = answerCurrentQuestion(session, i % 3 === 0 ? 'yes' : i % 3 === 1 ? 'probably' : 'no');
    }
    expect(session.phase).toBe('reveal');
    expect(session.answered.length).toBeGreaterThanOrEqual(6);
    expect(session.answered.length).toBeLessThanOrEqual(12);
  });

  it('reports reveal readiness with confidence, gap, and turn evidence', () => {
    let session = createSession();
    for (let i = 0; i < 6; i += 1) session = answerCurrentQuestion(session, 'yes');
    const readiness = revealReadiness(session);
    expect(readiness).toEqual(expect.objectContaining({ canReveal: expect.any(Boolean), confidence: expect.any(Number), gap: expect.any(Number), answeredCount: expect.any(Number) }));
  });

  it('wrong guess recovery suppresses the rejected guess and offers a different candidate', () => {
    let session = createSession();
    for (let i = 0; i < 12 && session.phase !== 'reveal'; i += 1) session = answerCurrentQuestion(session, 'yes');
    const rejected = session.guess?.food.id;
    expect(rejected).toBeTruthy();
    session = markGuessWrong(session);
    expect(session.suppressedFoodIds).toContain(rejected);
    expect(session.guess?.food.id).not.toBe(rejected);
    expect(session.currentQuestion?.id).toBeTruthy();
  });
});
