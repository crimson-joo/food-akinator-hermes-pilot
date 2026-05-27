import type { Question } from '../data/questions';
import { FOODS } from '../data/foods';
import type { Posterior } from './score';

export type QuestionChoice = Question & { expectedInformationGain: number };

export function selectNextQuestion(posterior: Posterior, questions: Question[], answeredIds: Set<string>): QuestionChoice | null {
  const choices = questions
    .filter((question) => !answeredIds.has(question.id))
    .map((question) => ({ ...question, expectedInformationGain: informationGainProxy(posterior, question) }))
    .filter((question) => question.expectedInformationGain > 0.0001)
    .sort((a, b) => b.expectedInformationGain - a.expectedInformationGain);
  return choices[0] ?? null;
}

function informationGainProxy(posterior: Posterior, question: Question): number {
  let weightedMean = 0;
  const affinities: Array<[number, number]> = [];
  for (const food of FOODS) {
    const p = posterior[food.id] ?? 0;
    if (p === 0) continue;
    const affinity = question.traits.reduce((sum, trait) => sum + food.traits[trait], 0) / question.traits.length;
    affinities.push([affinity, p]);
    weightedMean += affinity * p;
  }
  return affinities.reduce((sum, [affinity, p]) => sum + p * Math.pow(affinity - weightedMean, 2), 0);
}
