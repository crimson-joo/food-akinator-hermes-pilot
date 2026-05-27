import { describe, expect, it } from 'vitest';
import { FOODS } from '../data/foods';
import { QUESTIONS } from '../data/questions';
import { initializePosterior } from './score';
import { selectNextQuestion } from './selectQuestion';

describe('adaptive question selection', () => {
  it('selects an unanswered information-gain question instead of fixed order fallback', () => {
    const posterior = initializePosterior(FOODS);
    const next = selectNextQuestion(posterior, QUESTIONS, new Set(['spicy', 'soup']));
    expect(next).not.toBeNull();
    expect(next!.id).not.toBe('spicy');
    expect(next!.id).not.toBe('soup');
    expect(next!.expectedInformationGain).toBeGreaterThan(0);
  });
});
