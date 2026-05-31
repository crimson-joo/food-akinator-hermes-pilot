import { describe, expect, it } from 'vitest';
import { ANSWER_VALUES, type AnswerKey, type Candidate } from '../src/engine/domain.js';
import { startSession, submitAnswer } from '../src/engine/session.js';
import { foodCandidates, foodQuestions } from '../src/data/food-knowledge-base.js';

const dataset = { candidates: foodCandidates, questions: foodQuestions };
const representativeCandidateIds = [
  'kimchi-jjigae',
  'doenjang-jjigae',
  'budae-jjigae',
  'sundubu-jjigae',
  'seolleongtang',
  'haejangguk',
  'ramyeon',
  'janchi-guksu',
  'naengmyeon',
  'bibimbap',
  'kimchi-fried-rice',
  'jeyuk-deopbap',
  'tteokbokki',
  'gimbap',
  'fried-chicken',
  'donkatsu',
  'pizza',
  'hamburger',
  'jajangmyeon',
  'jjambbong',
] as const;

type SimulationResult = {
  target: Candidate;
  status: string;
  guessId: string | undefined;
  turn: number;
  askedQuestionIds: string[];
  topRankWhenStopped: number;
};

function scriptedAnswer(target: Candidate, questionId: string): AnswerKey {
  const expected = target.attributes[questionId] ?? 0;
  if (expected >= 0.75) return 'yes';
  if (expected >= 0.25) return 'probably';
  if (expected <= -0.75) return 'no';
  if (expected <= -0.25) return 'probably_not';
  return 'unknown';
}

function branchEntropy(askedQuestionIds: string[][], turnIndex: number): number {
  const counts = new Map<string, number>();
  for (const path of askedQuestionIds) {
    const key = path[turnIndex] ?? '__stopped__';
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const total = askedQuestionIds.length;
  return [...counts.values()].reduce((sum, count) => {
    const p = count / total;
    return sum - p * Math.log2(p);
  }, 0);
}

function simulate(target: Candidate): SimulationResult {
  let session = startSession(dataset);
  const askedQuestionIds: string[] = [];

  while (session.currentQuestion && session.status !== 'revealed' && session.status !== 'exhausted') {
    const questionId = session.currentQuestion.id;
    expect(askedQuestionIds, `${target.id} repeated ${questionId}`).not.toContain(questionId);
    askedQuestionIds.push(questionId);
    session = submitAnswer(session, { questionId, answer: scriptedAnswer(target, questionId) }, dataset);
  }

  const topRankWhenStopped = session.rankingPreview.findIndex((entry) => entry.candidateId === target.id) + 1;
  return {
    target,
    status: session.status,
    guessId: session.guess?.candidate.id,
    turn: session.turn,
    askedQuestionIds,
    topRankWhenStopped,
  };
}

describe('representative 20-food inference simulation', () => {
  it('keeps a broad Korean menu set guessable instead of overfitting the seven golden paths', () => {
    const targets = representativeCandidateIds.map((id) => {
      const candidate = foodCandidates.find((item) => item.id === id);
      expect(candidate, `missing representative candidate ${id}`).toBeDefined();
      return candidate!;
    });
    const results = targets.map(simulate);
    const exactHits = results.filter((result) => result.guessId === result.target.id);
    const topThreeOrExact = results.filter(
      (result) => result.guessId === result.target.id || (result.topRankWhenStopped > 0 && result.topRankWhenStopped <= 3),
    );
    const failedSummary = results
      .filter((result) => result.guessId !== result.target.id && result.topRankWhenStopped > 3)
      .map((result) => `${result.target.id}: guess=${result.guessId ?? result.status}, rank=${result.topRankWhenStopped}, path=${result.askedQuestionIds.join('>')}`);

    expect(exactHits.length, `exact hits: ${exactHits.length}/20; failures: ${failedSummary.join(' | ')}`).toBeGreaterThanOrEqual(14);
    expect(topThreeOrExact.length, `top3 coverage failures: ${failedSummary.join(' | ')}`).toBeGreaterThanOrEqual(18);
    for (const result of results) {
      expect(result.turn, `${result.target.id} took too many turns via ${result.askedQuestionIds.join('>')}`).toBeLessThanOrEqual(15);
    }
  });

  it('creates Akinator-like branch entropy after the shared opening question', () => {
    const paths = representativeCandidateIds.map((id) => simulate(foodCandidates.find((candidate) => candidate.id === id)!).askedQuestionIds);
    expect(new Set(paths.map((path) => path[0])).size).toBe(1);
    expect(branchEntropy(paths, 1)).toBeGreaterThanOrEqual(0.85);
    expect(branchEntropy(paths, 2)).toBeGreaterThanOrEqual(1.35);
    expect(new Set(paths.map((path) => path.slice(0, 4).join('>'))).size).toBeGreaterThanOrEqual(8);
  });
});
