import { describe, expect, it } from 'vitest';
import type { Candidate } from '../src/engine/domain.js';
import { scoreCandidates } from '../src/engine/scoring.js';

const soupCandidate: Candidate = {
  id: 'kimchi-jjigae',
  nameKo: '김치찌개',
  aliases: [],
  category: '찌개',
  tags: ['soup'],
  attributes: { 'q-soup': 1, 'q-fried': -0.8 },
  prior: 1,
  reveal: { oneLiner: '뜨끈한 국물 쪽이에요.', reasonSeeds: ['국물 선호'] },
  status: 'active',
};

const crispyCandidate: Candidate = {
  id: 'fried-chicken',
  nameKo: '치킨',
  aliases: [],
  category: '치킨',
  tags: ['fried'],
  attributes: { 'q-soup': -1, 'q-fried': 1 },
  prior: 1,
  reveal: { oneLiner: '바삭한 보상감 쪽이에요.', reasonSeeds: ['튀김 선호'] },
  status: 'active',
};

describe('engine scoring', () => {
  it('moves ranking more strongly for yes/no than probably/probably-not', () => {
    const yesScores = scoreCandidates([soupCandidate, crispyCandidate], [
      { questionId: 'q-soup', answer: 'yes' },
    ]);
    const probablyScores = scoreCandidates([soupCandidate, crispyCandidate], [
      { questionId: 'q-soup', answer: 'probably' },
    ]);

    const [yesTop, yesRunnerUp] = yesScores;
    const [probablyTop, probablyRunnerUp] = probablyScores;
    expect(yesTop).toBeDefined();
    expect(yesRunnerUp).toBeDefined();
    expect(probablyTop).toBeDefined();
    expect(probablyRunnerUp).toBeDefined();

    const yesGap = yesTop!.score - yesRunnerUp!.score;
    const probablyGap = probablyTop!.score - probablyRunnerUp!.score;

    expect(yesTop!.candidate.id).toBe('kimchi-jjigae');
    expect(probablyTop!.candidate.id).toBe('kimchi-jjigae');
    expect(yesGap).toBeGreaterThan(probablyGap);
  });

  it('keeps unknown near-neutral without distorting candidate order by attributes', () => {
    const scores = scoreCandidates([soupCandidate, crispyCandidate], [
      { questionId: 'q-soup', answer: 'unknown' },
    ]);

    const [top, runnerUp] = scores;
    expect(top).toBeDefined();
    expect(runnerUp).toBeDefined();
    expect(Math.abs(top!.score - runnerUp!.score)).toBeLessThan(0.000001);
  });

  it('lets a negative answer lift a contrasting candidate', () => {
    const scores = scoreCandidates([soupCandidate, crispyCandidate], [
      { questionId: 'q-soup', answer: 'no' },
    ]);

    const [top, runnerUp] = scores;
    expect(top).toBeDefined();
    expect(runnerUp).toBeDefined();
    expect(top!.candidate.id).toBe('fried-chicken');
    expect(top!.score).toBeGreaterThan(runnerUp!.score);
  });
});
