import { FOODS, type Food } from '../data/foods';
import type { Question } from '../data/questions';

export type Answer = 'yes' | 'probably' | 'unknown' | 'probablyNot' | 'no';
export type Posterior = Record<string, number>;
const ANSWER_STRENGTH: Record<Answer, number> = { yes: 0.92, probably: 0.7, unknown: 0.5, probablyNot: 0.3, no: 0.08 };

export function initializePosterior(foods: Food[] = FOODS, suppressed = new Set<string>()): Posterior {
  const available = foods.filter((food) => !suppressed.has(food.id));
  const p = 1 / available.length;
  return Object.fromEntries(available.map((food) => [food.id, p]));
}

export function applyAnswer(prior: Posterior, question: Question, answer: Answer, foods: Food[] = FOODS): Posterior {
  if (answer === 'unknown') return normalize({ ...prior });
  const target = ANSWER_STRENGTH[answer];
  const next: Posterior = {};
  for (const food of foods) {
    if (!(food.id in prior)) continue;
    const affinity = question.traits.reduce((sum, trait) => sum + food.traits[trait], 0) / question.traits.length;
    const distance = Math.abs(affinity - target);
    const likelihood = Math.max(0.03, 1 - distance);
    next[food.id] = prior[food.id] * likelihood;
  }
  return normalize(next);
}

export function normalize(scores: Posterior): Posterior {
  const total = Object.values(scores).reduce((sum, value) => sum + value, 0) || 1;
  return Object.fromEntries(Object.entries(scores).map(([id, value]) => [id, value / total]));
}

export function topCandidates(posterior: Posterior, limit = 3, foods: Food[] = FOODS) {
  const byId = new Map(foods.map((food) => [food.id, food]));
  return Object.entries(posterior)
    .map(([id, probability]) => ({ food: byId.get(id)!, probability }))
    .filter((item) => item.food)
    .sort((a, b) => b.probability - a.probability)
    .slice(0, limit);
}
