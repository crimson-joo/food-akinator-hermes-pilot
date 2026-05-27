import { describe, expect, it } from 'vitest';
import { FOODS } from '../data/foods';
import { QUESTIONS } from '../data/questions';
import { initializePosterior, applyAnswer, topCandidates } from './score';

describe('food inference scoring', () => {
  it('ships a real Korean food catalogue and discriminating question bank', () => {
    expect(FOODS.length).toBeGreaterThanOrEqual(24);
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(30);
    expect(new Set(FOODS.map((food) => food.id)).size).toBe(FOODS.length);
    for (const question of QUESTIONS) {
      const yesCount = FOODS.filter((food) => question.traits.some((trait) => food.traits[trait] >= 0.65)).length;
      const noCount = FOODS.filter((food) => question.traits.some((trait) => food.traits[trait] <= 0.35)).length;
      expect(yesCount, question.id).toBeGreaterThan(0);
      expect(noCount, question.id).toBeGreaterThan(0);
    }
  });

  it('moves strong yes/no more than probably answers and keeps unknown near neutral', () => {
    const question = QUESTIONS.find((item) => item.id === 'spicy')!;
    const prior = initializePosterior(FOODS);
    const yes = applyAnswer(prior, question, 'yes');
    const maybeYes = applyAnswer(prior, question, 'probably');
    const unknown = applyAnswer(prior, question, 'unknown');
    const no = applyAnswer(prior, question, 'no');
    const tteokbokki = 'tteokbokki';
    const seolleongtang = 'seolleongtang';
    expect(yes[tteokbokki]).toBeGreaterThan(maybeYes[tteokbokki]);
    expect(no[seolleongtang]).toBeGreaterThan(yes[seolleongtang]);
    expect(Math.abs(unknown[tteokbokki] - prior[tteokbokki])).toBeLessThan(0.01);
  });

  it('ranks a target food after matching answers', () => {
    let posterior = initializePosterior(FOODS);
    for (const id of ['spicy', 'street-food', 'rice-cake', 'saucy']) {
      posterior = applyAnswer(posterior, QUESTIONS.find((q) => q.id === id)!, 'yes');
    }
    expect(topCandidates(posterior, 1)[0].food.id).toBe('tteokbokki');
  });
});
