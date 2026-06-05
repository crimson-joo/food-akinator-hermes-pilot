import { describe, expect, it } from 'vitest';
import { foodCandidates, foodQuestions } from '../src/data/food-knowledge-base.js';
import {
  CONTROLLED_DEMO_THRESHOLDS,
  FULL_LAUNCH_CANDIDATE_THRESHOLDS,
  representativeSimulationCases,
} from './fixtures/representative-simulation-matrix.js';
import {
  detectLeakMarkers,
  runSimulationSuite,
  writeSimulationQualityReport,
} from '../src/engine/simulation-quality.js';

const dataset = { candidates: foodCandidates, questions: foodQuestions };

describe('representative simulation quality gate', () => {
  it('produces reportable per-case results and aggregate metrics through the public session API', () => {
    const suite = runSimulationSuite(dataset, representativeSimulationCases);

    expect(suite.cases).toHaveLength(32);
    expect(suite.metrics.totalCases).toBe(32);
    expect(suite.metrics.canonicalCases).toBe(20);
    expect(suite.metrics.recoveryCases).toBeGreaterThanOrEqual(4);
    expect(suite.metrics.unknownStressCases).toBeGreaterThanOrEqual(4);
    expect(suite.thresholds.controlledDemo.passed).toBe(true);

    for (const result of suite.cases) {
      expect(result.caseId).toBeTruthy();
      expect(result.targetCandidateId).toBeTruthy();
      expect(result.targetNameKo).toBeTruthy();
      expect(result.strategy).toMatch(/canonicalAttributes|mixedUncertainty|unknownHeavy|rejectedGuessRecovery/);
      expect(result.finalStatus).toMatch(/revealed|exhausted|asking|confident/);
      expect(result.finalTurn).toBeGreaterThanOrEqual(1);
      expect(new Set(result.askedQuestionIds).size, `${result.caseId} repeated questions`).toBe(result.askedQuestionIds.length);
      expect(result.answers.length).toBe(result.askedQuestionIds.length);
      expect(Array.isArray(result.userVisibleCopy)).toBe(true);
      expect(result.leakMarkers, `${result.caseId} leaked internals`).toEqual([]);
    }

    expect(suite.metrics.exactFirstGuessRate).toBeGreaterThanOrEqual(CONTROLLED_DEMO_THRESHOLDS.exactFirstGuessRate);
    expect(suite.metrics.top3AtFirstStopRate).toBeGreaterThanOrEqual(CONTROLLED_DEMO_THRESHOLDS.top3AtFirstStopRate);
    expect(suite.metrics.maxFirstGuessTurn).toBeLessThanOrEqual(CONTROLLED_DEMO_THRESHOLDS.maxFirstGuessTurn);
    expect(suite.metrics.medianFirstGuessTurn).toBeLessThanOrEqual(CONTROLLED_DEMO_THRESHOLDS.medianFirstGuessTurn);
    expect(suite.metrics.branchEntropyByTurn['1']).toBeGreaterThanOrEqual(CONTROLLED_DEMO_THRESHOLDS.minBranchEntropyByTurn['1']);
    expect(suite.metrics.branchEntropyByTurn['2']).toBeGreaterThanOrEqual(CONTROLLED_DEMO_THRESHOLDS.minBranchEntropyByTurn['2']);
    expect(suite.metrics.uniquePrefix4Count).toBeGreaterThanOrEqual(CONTROLLED_DEMO_THRESHOLDS.minUniquePrefix4Count);
    expect(suite.metrics.leakFree).toBe(true);
  });

  it('passes the stricter full-launch candidate thresholds without hiding failed thresholds', () => {
    const suite = runSimulationSuite(dataset, representativeSimulationCases);

    expect(suite.thresholds.fullLaunchCandidate.passed).toBe(true);
    expect(suite.thresholds.fullLaunchCandidate.failedCriteria).toEqual([]);
    expect(suite.thresholds.fullLaunchCandidate.thresholds).toEqual(FULL_LAUNCH_CANDIDATE_THRESHOLDS);
  });

  it('gates answer-trace rationale, recovery, unknown-heavy behavior, false confidence, and leak safety', () => {
    const suite = runSimulationSuite(dataset, representativeSimulationCases);
    const canonicalReveals = suite.cases.filter(
      (result) => result.strategy === 'canonicalAttributes' && result.finalStatus === 'revealed',
    );

    expect(canonicalReveals.length).toBeGreaterThanOrEqual(18);
    for (const result of canonicalReveals) {
      expect(result.answerTraceCount, `${result.caseId} answer trace too thin`).toBeGreaterThanOrEqual(2);
      expect(result.answerTraceMatchesAnswers, `${result.caseId} lacks answer-derived trace`).toBeGreaterThanOrEqual(1);
      expect(result.leakMarkers).toEqual([]);
    }

    const recoveryCases = suite.cases.filter((result) => result.strategy === 'rejectedGuessRecovery');
    expect(recoveryCases.length).toBeGreaterThanOrEqual(4);
    for (const result of recoveryCases) {
      expect(result.recoveryCount, `${result.caseId} did not reject a guess`).toBeGreaterThanOrEqual(1);
      const firstRecoveryQuestionIndex = (result.firstGuessTurn ?? 1) - 1;
      expect(result.askedQuestionRoles[firstRecoveryQuestionIndex], `${result.caseId} first recovery question`).toBe('recovery_disambiguation');
      expect(result.finalGuessCandidateId, `${result.caseId} repeated rejected first guess`).not.toBe(result.firstGuessCandidateId);
    }
    expect(suite.metrics.recoverySuccessRate).toBeGreaterThanOrEqual(CONTROLLED_DEMO_THRESHOLDS.minRecoverySuccessRate);

    const unknownCases = suite.cases.filter((result) => result.strategy === 'unknownHeavy');
    expect(unknownCases.length).toBeGreaterThanOrEqual(4);
    for (const result of unknownCases) {
      expect(result.unknownCount).toBeGreaterThanOrEqual(5);
      expect(['exhausted', 'asking']).toContain(result.finalStatus);
      expect(result.firstGuessCandidateId, `${result.caseId} made a blind guess`).toBeUndefined();
    }
    expect(suite.metrics.falseConfidenceRate).toBeLessThanOrEqual(CONTROLLED_DEMO_THRESHOLDS.maxFalseConfidenceRate);
    expect(suite.metrics.unknownGracefulRate).toBe(1);
  });

  it('scores rejected-guess recovery only when the final guess is the target, not merely different from the rejected guess', () => {
    const suite = runSimulationSuite(dataset, representativeSimulationCases);
    const recoveryCases = suite.cases.filter((result) => result.strategy === 'rejectedGuessRecovery');

    expect(recoveryCases.length).toBeGreaterThanOrEqual(4);
    expect(recoveryCases.every((result) => result.recoveryCount >= 1)).toBe(true);
    expect(recoveryCases.every((result) => result.finalGuessCandidateId !== result.firstGuessCandidateId)).toBe(true);
    expect(recoveryCases.every((result) => result.exactFinalGuess)).toBe(true);
    expect(suite.metrics.recoverySuccessRate).toBe(1);
    expect(suite.thresholds.fullLaunchCandidate.failedCriteria).not.toContain('recovery success below threshold');
  });

  it('generates JSON and Markdown reports with sanitized user-facing sections', async () => {
    const suite = runSimulationSuite(dataset, representativeSimulationCases);
    const report = await writeSimulationQualityReport(suite, {
      outputJsonPath: '.hermes/runs/t_c72bfb98/test-simulation-quality-report.json',
      outputMarkdownPath: '.hermes/runs/t_c72bfb98/test-simulation-quality-report.md',
    });

    expect(report.jsonPath).toContain('simulation-quality-report.json');
    expect(report.markdownPath).toContain('simulation-quality-report.md');
    expect(report.markdown).toContain('Controlled demo / alpha');
    expect(report.markdown).toContain('Full-launch candidate');
    expect(report.markdown).toContain('PASS');
    expect(detectLeakMarkers(report.markdown)).toEqual([]);
  });
});
