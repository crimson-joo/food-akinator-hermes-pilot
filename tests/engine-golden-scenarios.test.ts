import { describe, expect, it } from 'vitest';
import type { AnswerKey } from '../src/engine/domain.js';
import { startSession, submitAnswer, submitGuessFeedback } from '../src/engine/session.js';
import { goldenDataset, goldenScenarios } from './fixtures/golden-scenarios.js';

function answerCurrent(session: ReturnType<typeof startSession>, answer: AnswerKey) {
  expect(session.currentQuestion?.id).toBeDefined();
  return submitAnswer(session, { questionId: session.currentQuestion!.id, answer }, goldenDataset);
}

function playScenario(scenario: (typeof goldenScenarios)[number]) {
  let session = startSession(goldenDataset);
  const askedQuestionIds: string[] = [];
  let rejectedFirstGuess = false;
  let recoveryQuestionId: string | undefined;

  for (let step = 0; step < scenario.maxSteps; step += 1) {
    if (!session.currentQuestion || session.status === 'revealed' || session.status === 'exhausted') {
      break;
    }

    const questionId = session.currentQuestion.id;
    expect(askedQuestionIds).not.toContain(questionId);
    askedQuestionIds.push(questionId);

    const answer = scenario.answers[questionId];
    if (scenario.expectedOutcome.kind === 'exhausted') {
      expect(answer).toBeUndefined();
    } else {
      expect(answer, `${scenario.id} must script selected question ${questionId}`).toBeDefined();
    }

    session = answerCurrent(session, answer ?? 'unknown');

    if (session.status === 'revealed' && scenario.rejectFirstGuess && !rejectedFirstGuess) {
      session = submitGuessFeedback(
        session,
        { candidateId: session.guess!.candidate.id, accepted: false },
        goldenDataset,
      );
      rejectedFirstGuess = true;
      recoveryQuestionId = session.currentQuestion?.id;
    }
  }

  return { session, askedQuestionIds, rejectedFirstGuess, recoveryQuestionId };
}

describe('golden Korean food scenarios', () => {
  it('covers the required representative food categories without bulk-generating the dataset', () => {
    expect(goldenScenarios).toHaveLength(7);
    expect(goldenScenarios.map((scenario) => scenario.categoryCoverage)).toEqual(expect.arrayContaining([
      'soup_stew',
      'fried_crispy',
      'spicy_snack',
      'rice_bowl',
      'noodle_comfort',
    ]));
    expect(goldenDataset.candidates).toHaveLength(7);
    expect(goldenDataset.questions).toHaveLength(14);
    expect(goldenDataset.questions.map((question) => question.role)).toEqual(expect.arrayContaining([
      'broad_split',
      'family_lock',
      'signature_discriminator',
      'false_path_guardrail',
      'recovery_disambiguation',
    ]));
  });

  it('diverges soup/stew and fried/crispy paths within the first three questions', () => {
    const soupPath = playScenario(goldenScenarios.find((scenario) => scenario.id === 'kimchi-jjigae-soup')!).askedQuestionIds;
    const friedPath = playScenario(goldenScenarios.find((scenario) => scenario.id === 'fried-chicken-crispy')!).askedQuestionIds;

    expect(soupPath[0]).toBe(friedPath[0]);
    expect(soupPath.slice(1, 3)).not.toEqual(friedPath.slice(1, 3));
  });

  it.each(goldenScenarios)('$id reaches its expected outcome without repeated questions and with Korean reason seeds', (scenario) => {
    const { session, askedQuestionIds, rejectedFirstGuess, recoveryQuestionId } = playScenario(scenario);

    expect(new Set(askedQuestionIds).size).toBe(askedQuestionIds.length);
    expect(askedQuestionIds.length).toBeGreaterThanOrEqual(scenario.minDivergenceQuestions);

    if (scenario.expectedOutcome.kind === 'reveal') {
      expect(session.status).toBe('revealed');
      expect(session.guess?.candidate.id).toBe(scenario.expectedOutcome.candidateId);
      expect(session.turn).toBeGreaterThanOrEqual(scenario.expectedOutcome.minTurn);
      expect(session.turn).toBeLessThanOrEqual(scenario.expectedOutcome.maxTurn);
      expect(session.guess?.reasonSeeds.join(' ')).toMatch(/[가-힣]/);
      for (const seed of scenario.expectedOutcome.reasonSeedsInclude) {
        expect(session.guess?.reasonSeeds.join(' ')).toContain(seed);
      }
      expect(session.copy.helperKo).not.toMatch(/score|probability|q-/i);
      return;
    }

    if (scenario.expectedOutcome.kind === 'recovery') {
      expect(rejectedFirstGuess).toBe(true);
      expect(recoveryQuestionId).toBeDefined();
      expect(goldenDataset.questions.find((question) => question.id === recoveryQuestionId)?.role).toBe(scenario.expectedOutcome.nextRole);
      expect(goldenDataset.questions.find((question) => question.id === recoveryQuestionId)?.revealRisk).toBeLessThanOrEqual(1);
      expect(session.rejectedCandidateIds).toContain(scenario.expectedOutcome.rejectedCandidateId);
      expect(session.topCandidate?.id).not.toBe(scenario.expectedOutcome.rejectedCandidateId);
      expect(session.status).toBe('revealed');
      expect(session.guess?.candidate.id).toBe(scenario.expectedOutcome.finalCandidateId);
      expect(session.guess?.reasonSeeds.join(' ')).toMatch(/[가-힣]/);
      for (const seed of scenario.expectedOutcome.reasonSeedsInclude) {
        expect(session.guess?.reasonSeeds.join(' ')).toContain(seed);
      }
      return;
    }

    expect(session.status).toBe('exhausted');
    expect(session.characterCue).toBe('exhausted');
    expect(session.guess).toBeUndefined();
    expect(session.copy.headlineKo).toContain('단서');
  });
});
