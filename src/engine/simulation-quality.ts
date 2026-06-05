import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { AnswerKey, Candidate, Question, QuestionRole } from './domain.js';
import { startSession, submitAnswer, submitGuessFeedback, type EngineSession, type SessionDataset } from './session.js';

export type SimulationAnswerStrategy =
  | 'canonicalAttributes'
  | 'mixedUncertainty'
  | 'unknownHeavy'
  | 'rejectedGuessRecovery';

export type RepresentativeSimulationCase = {
  id: string;
  targetCandidateId: string;
  cohort: string;
  strategy: SimulationAnswerStrategy;
  expected?: {
    maxFirstGuessTurn?: number;
    minAnswerTraceCount?: number;
    allowWrongFirstGuess?: boolean;
    expectedRecoveryQuestionRole?: QuestionRole;
    unknownAnswersBeforeStop?: number;
  };
};

export type SimulationCaseResult = {
  caseId: string;
  targetCandidateId: string;
  targetNameKo: string;
  strategy: SimulationAnswerStrategy;
  finalStatus: EngineSession['status'];
  firstGuessCandidateId?: string;
  finalGuessCandidateId?: string;
  exactFirstGuess: boolean;
  exactFinalGuess: boolean;
  targetRankAtFirstStop: number | null;
  firstGuessTurn: number | null;
  finalTurn: number;
  askedQuestionIds: string[];
  askedQuestionRoles: QuestionRole[];
  answers: { questionId: string; answer: AnswerKey }[];
  recoveryCount: number;
  unknownCount: number;
  answerTraceCount: number;
  answerTraceMatchesAnswers: number;
  userVisibleCopy: string[];
  leakMarkers: string[];
};

export type SimulationSuiteMetrics = {
  totalCases: number;
  canonicalCases: number;
  recoveryCases: number;
  unknownStressCases: number;
  exactFirstGuessRate: number;
  exactFinalGuessRate: number;
  top3AtFirstStopRate: number;
  medianFirstGuessTurn: number;
  p90FirstGuessTurn: number;
  maxFirstGuessTurn: number;
  branchEntropyByTurn: Record<string, number>;
  uniquePrefix4Count: number;
  averageAnswerTraceCount: number;
  rationaleCoverageRate: number;
  recoveryCaseRate: number;
  recoverySuccessRate: number;
  falseConfidenceRate: number;
  unknownGracefulRate: number;
  leakFree: boolean;
  failedCases: string[];
};

type ThresholdSet = {
  exactFirstGuessRate: number;
  top3AtFirstStopRate: number;
  maxFirstGuessTurn: number;
  medianFirstGuessTurn: number;
  p90FirstGuessTurn?: number;
  minBranchEntropyByTurn: Record<string, number>;
  minUniquePrefix4Count: number;
  minAverageAnswerTraceCount: number;
  minRationaleCoverageRate: number;
  minRecoverySuccessRate: number;
  maxFalseConfidenceRate: number;
  minUnknownGracefulRate: number;
};

export type ThresholdVerdict = {
  passed: boolean;
  failedCriteria: string[];
  thresholds: ThresholdSet;
};

export type SimulationSuiteResult = {
  cases: SimulationCaseResult[];
  metrics: SimulationSuiteMetrics;
  thresholds: {
    controlledDemo: ThresholdVerdict;
    fullLaunchCandidate: ThresholdVerdict;
  };
};

export const CONTROLLED_DEMO_THRESHOLDS: ThresholdSet = {
  exactFirstGuessRate: 0.7,
  top3AtFirstStopRate: 0.9,
  maxFirstGuessTurn: 15,
  medianFirstGuessTurn: 10,
  minBranchEntropyByTurn: { '1': 0.85, '2': 1.35 },
  minUniquePrefix4Count: 8,
  minAverageAnswerTraceCount: 2,
  minRationaleCoverageRate: 0.9,
  minRecoverySuccessRate: 0,
  maxFalseConfidenceRate: 0.1,
  minUnknownGracefulRate: 1,
};

export const FULL_LAUNCH_CANDIDATE_THRESHOLDS: ThresholdSet = {
  exactFirstGuessRate: 0.85,
  top3AtFirstStopRate: 0.95,
  maxFirstGuessTurn: 12,
  medianFirstGuessTurn: 8,
  p90FirstGuessTurn: 11,
  minBranchEntropyByTurn: { '1': 1.0, '2': 1.6, '3': 1.9 },
  minUniquePrefix4Count: 10,
  minAverageAnswerTraceCount: 3,
  minRationaleCoverageRate: 1,
  minRecoverySuccessRate: 0.9,
  maxFalseConfidenceRate: 0.05,
  minUnknownGracefulRate: 1,
};

const LEAK_PATTERN = /score|probability|top1|top3|attribute|clue:|q-[a-z0-9-]+/gi;
const ANSWER_DERIVED_MARKERS = ['답한 단서', '아니라고 답한 단서', '단서가 맞다고 답한 단서', '당긴다고 답한 단서', '떠오른다고 답한 단서'];
const REPRESENTATIVE_SIMULATION_POLICY = {
  softCapTurn: 7,
  softCapConfidence: 0.5,
  hardCapTurn: 10,
};

export function detectLeakMarkers(text: string): string[] {
  return Array.from(new Set(text.match(LEAK_PATTERN) ?? []));
}

export function runSimulationSuite(dataset: SessionDataset, cases: RepresentativeSimulationCase[]): SimulationSuiteResult {
  const results = cases.map((simulationCase) => runSimulationCase(dataset, simulationCase));
  const metrics = calculateSimulationMetrics(results);
  return {
    cases: results,
    metrics,
    thresholds: {
      controlledDemo: evaluateThresholds(metrics, CONTROLLED_DEMO_THRESHOLDS),
      fullLaunchCandidate: evaluateThresholds(metrics, FULL_LAUNCH_CANDIDATE_THRESHOLDS),
    },
  };
}

function runSimulationCase(dataset: SessionDataset, simulationCase: RepresentativeSimulationCase): SimulationCaseResult {
  const target = candidateById(dataset.candidates, simulationCase.targetCandidateId);
  let session = startSession(dataset, REPRESENTATIVE_SIMULATION_POLICY);
  const askedQuestionIds: string[] = [];
  const askedQuestionRoles: QuestionRole[] = [];
  const answers: { questionId: string; answer: AnswerKey }[] = [];
  const userVisibleCopy: string[] = copyFromSession(session);
  let firstGuessSession: EngineSession | null = null;
  let recoveryCount = 0;
  let recoveryQuestionCaptured = false;

  while (session.currentQuestion && session.status !== 'revealed' && session.status !== 'exhausted') {
    const question = session.currentQuestion;
    askedQuestionIds.push(question.id);
    askedQuestionRoles.push(question.role);
    const answer = answerForQuestion(target, question, answers.length, simulationCase);
    answers.push({ questionId: question.id, answer });
    session = submitAnswer(session, { questionId: question.id, answer }, dataset);
    userVisibleCopy.push(...copyFromSession(session));
  }

  if (session.guess) {
    firstGuessSession = session;
    if (simulationCase.strategy === 'rejectedGuessRecovery') {
      recoveryCount += 1;
      session = submitGuessFeedback(session, { candidateId: session.guess.candidate.id, accepted: false }, dataset);
      userVisibleCopy.push(...copyFromSession(session));
      if (session.currentQuestion && !recoveryQuestionCaptured) {
        askedQuestionIds.unshift(session.currentQuestion.id);
        askedQuestionRoles.unshift(session.currentQuestion.role);
        recoveryQuestionCaptured = true;
      }
      while (session.currentQuestion && session.status !== 'revealed' && session.status !== 'exhausted') {
        const question = session.currentQuestion;
        if (!recoveryQuestionCaptured) {
          askedQuestionIds.push(question.id);
          askedQuestionRoles.push(question.role);
        } else {
          recoveryQuestionCaptured = false;
        }
        const answer = answerForQuestion(target, question, answers.length, simulationCase);
        answers.push({ questionId: question.id, answer });
        session = submitAnswer(session, { questionId: question.id, answer }, dataset);
        userVisibleCopy.push(...copyFromSession(session));
      }
    }
  }

  const firstGuess = firstGuessSession?.guess?.candidate.id;
  const finalGuess = session.guess?.candidate.id ?? firstGuess;
  const targetRankAtFirstStop = firstGuessSession ? rankOf(firstGuessSession, target.id) : null;
  const answerTrace = session.guess?.answerTrace ?? firstGuessSession?.guess?.answerTrace ?? [];
  const answerTraceMatchesAnswers = answerTrace.filter((line) => ANSWER_DERIVED_MARKERS.some((marker) => line.includes(marker))).length;
  const visibleCopy = [...userVisibleCopy, ...answerTrace];

  return {
    caseId: simulationCase.id,
    targetCandidateId: target.id,
    targetNameKo: target.nameKo,
    strategy: simulationCase.strategy,
    finalStatus: session.status,
    ...(firstGuess ? { firstGuessCandidateId: firstGuess } : {}),
    ...(finalGuess ? { finalGuessCandidateId: finalGuess } : {}),
    exactFirstGuess: firstGuess === target.id,
    exactFinalGuess: finalGuess === target.id,
    targetRankAtFirstStop,
    firstGuessTurn: firstGuessSession?.turn ?? null,
    finalTurn: session.turn,
    askedQuestionIds,
    askedQuestionRoles,
    answers,
    recoveryCount,
    unknownCount: answers.filter((answer) => answer.answer === 'unknown').length,
    answerTraceCount: answerTrace.length,
    answerTraceMatchesAnswers,
    userVisibleCopy: visibleCopy,
    leakMarkers: detectLeakMarkers(visibleCopy.join('\n')),
  };
}

function answerForQuestion(target: Candidate, question: Question, answerIndex: number, simulationCase: RepresentativeSimulationCase): AnswerKey {
  if (simulationCase.strategy === 'unknownHeavy' && answerIndex < (simulationCase.expected?.unknownAnswersBeforeStop ?? 5)) {
    return 'unknown';
  }
  if (simulationCase.strategy === 'mixedUncertainty' && answerIndex % 3 === 2) {
    return 'unknown';
  }
  return canonicalAnswer(target.attributes[question.id] ?? 0);
}

function canonicalAnswer(expected: number): AnswerKey {
  if (expected >= 0.75) return 'yes';
  if (expected >= 0.25) return 'probably';
  if (expected <= -0.75) return 'no';
  if (expected <= -0.25) return 'probably_not';
  return 'unknown';
}

function candidateById(candidates: Candidate[], id: string): Candidate {
  const candidate = candidates.find((item) => item.id === id);
  if (!candidate) throw new Error(`Missing representative candidate ${id}`);
  return candidate;
}

function copyFromSession(session: EngineSession): string[] {
  return [session.copy.headlineKo, session.copy.helperKo].filter((line): line is string => Boolean(line));
}

function rankOf(session: EngineSession, targetCandidateId: string): number | null {
  const index = session.rankingPreview.findIndex((entry) => entry.candidateId === targetCandidateId);
  return index >= 0 ? index + 1 : null;
}

function calculateSimulationMetrics(results: SimulationCaseResult[]): SimulationSuiteMetrics {
  const canonical = results.filter((result) => result.strategy === 'canonicalAttributes');
  const recovery = results.filter((result) => result.strategy === 'rejectedGuessRecovery');
  const unknown = results.filter((result) => result.strategy === 'unknownHeavy');
  const canonicalTurns = canonical.map((result) => result.firstGuessTurn).filter((turn): turn is number => turn !== null);
  const firstStopTop3 = canonical.filter((result) => result.exactFirstGuess || (result.targetRankAtFirstStop !== null && result.targetRankAtFirstStop <= 3));
  const falseConfidence = canonical.filter(
    (result) => !result.exactFirstGuess && (result.targetRankAtFirstStop === null || result.targetRankAtFirstStop > 3),
  );
  const recoverySuccesses = recovery.filter((result) => result.exactFinalGuess);
  const gracefulUnknown = unknown.filter(
    (result) => (result.finalStatus === 'exhausted' || result.finalStatus === 'asking') && !result.firstGuessCandidateId,
  );
  const canonicalInteractionPaths = canonical.map(interactionPath);

  return {
    totalCases: results.length,
    canonicalCases: canonical.length,
    recoveryCases: recovery.length,
    unknownStressCases: unknown.length,
    exactFirstGuessRate: ratio(canonical.filter((result) => result.exactFirstGuess).length, canonical.length),
    exactFinalGuessRate: ratio(canonical.filter((result) => result.exactFinalGuess).length, canonical.length),
    top3AtFirstStopRate: ratio(firstStopTop3.length, canonical.length),
    medianFirstGuessTurn: percentile(canonicalTurns, 0.5),
    p90FirstGuessTurn: percentile(canonicalTurns, 0.9),
    maxFirstGuessTurn: canonicalTurns.length > 0 ? Math.max(...canonicalTurns) : 0,
    branchEntropyByTurn: {
      '1': branchEntropy(canonicalInteractionPaths, 1),
      '2': branchEntropy(canonicalInteractionPaths, 2),
      '3': branchEntropy(canonicalInteractionPaths, 3),
    },
    uniquePrefix4Count: new Set(canonicalInteractionPaths.map((path) => path.slice(0, 4).join('>'))).size,
    averageAnswerTraceCount: average(canonical.map((result) => result.answerTraceCount)),
    rationaleCoverageRate: ratio(canonical.filter((result) => result.answerTraceCount >= 2 && result.answerTraceMatchesAnswers >= 1).length, canonical.length),
    recoveryCaseRate: ratio(recovery.length, results.length),
    recoverySuccessRate: ratio(recoverySuccesses.length, recovery.length),
    falseConfidenceRate: ratio(falseConfidence.length, canonical.length),
    unknownGracefulRate: ratio(gracefulUnknown.length, unknown.length),
    leakFree: results.every((result) => result.leakMarkers.length === 0),
    failedCases: results
      .filter((result) => result.leakMarkers.length > 0 || (result.strategy === 'canonicalAttributes' && !result.exactFirstGuess && (result.targetRankAtFirstStop === null || result.targetRankAtFirstStop > 3)))
      .map((result) => result.caseId),
  };
}

function interactionPath(result: SimulationCaseResult): string[] {
  return result.answers.map((answer) => `${answer.questionId}:${answer.answer}`);
}

function branchEntropy(paths: string[][], turnIndex: number): number {
  const counts = new Map<string, number>();
  for (const path of paths) {
    const key = path.slice(0, turnIndex + 1).join('>') || '__stopped__';
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.values()].reduce((sum, count) => {
    const probability = count / paths.length;
    return sum - probability * Math.log2(probability);
  }, 0);
}

function evaluateThresholds(metrics: SimulationSuiteMetrics, thresholds: ThresholdSet): ThresholdVerdict {
  const failedCriteria: string[] = [];
  if (metrics.exactFirstGuessRate < thresholds.exactFirstGuessRate) failedCriteria.push('exact first guess rate below threshold');
  if (metrics.top3AtFirstStopRate < thresholds.top3AtFirstStopRate) failedCriteria.push('top3 first-stop rate below threshold');
  if (metrics.maxFirstGuessTurn > thresholds.maxFirstGuessTurn) failedCriteria.push('max first guess turn over budget');
  if (metrics.medianFirstGuessTurn > thresholds.medianFirstGuessTurn) failedCriteria.push('median first guess turn over budget');
  if (thresholds.p90FirstGuessTurn !== undefined && metrics.p90FirstGuessTurn > thresholds.p90FirstGuessTurn) failedCriteria.push('p90 first guess turn over budget');
  for (const [turn, threshold] of Object.entries(thresholds.minBranchEntropyByTurn)) {
    if ((metrics.branchEntropyByTurn[turn] ?? 0) < threshold) failedCriteria.push(`entropy turn ${turn} below threshold`);
  }
  if (metrics.uniquePrefix4Count < thresholds.minUniquePrefix4Count) failedCriteria.push('unique prefix4 diversity below threshold');
  if (metrics.averageAnswerTraceCount < thresholds.minAverageAnswerTraceCount) failedCriteria.push('rationale average answer trace below threshold');
  if (metrics.rationaleCoverageRate < thresholds.minRationaleCoverageRate) failedCriteria.push('rationale coverage below threshold');
  if (metrics.recoverySuccessRate < thresholds.minRecoverySuccessRate) failedCriteria.push('recovery success below threshold');
  if (metrics.falseConfidenceRate > thresholds.maxFalseConfidenceRate) failedCriteria.push('false confidence above threshold');
  if (metrics.unknownGracefulRate < thresholds.minUnknownGracefulRate) failedCriteria.push('unknown-heavy graceful behavior below threshold');
  if (!metrics.leakFree) failedCriteria.push('internal leak markers present');
  return { passed: failedCriteria.length === 0, failedCriteria, thresholds };
}

function percentile(values: number[], fraction: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil(fraction * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(sorted.length - 1, index))] ?? 0;
}

function average(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function ratio(count: number, total: number): number {
  return total === 0 ? 0 : count / total;
}

export async function writeSimulationQualityReport(
  suite: SimulationSuiteResult,
  options: { outputJsonPath: string; outputMarkdownPath: string },
): Promise<{ jsonPath: string; markdownPath: string; markdown: string }> {
  const markdown = renderMarkdownReport(suite);
  await mkdir(dirname(options.outputJsonPath), { recursive: true });
  await mkdir(dirname(options.outputMarkdownPath), { recursive: true });
  await writeFile(options.outputJsonPath, `${JSON.stringify(suite, null, 2)}\n`, 'utf8');
  await writeFile(options.outputMarkdownPath, markdown, 'utf8');
  return { jsonPath: options.outputJsonPath, markdownPath: options.outputMarkdownPath, markdown };
}

function renderMarkdownReport(suite: SimulationSuiteResult): string {
  const m = suite.metrics;
  const full = suite.thresholds.fullLaunchCandidate;
  const controlled = suite.thresholds.controlledDemo;
  const fullVerdict = full.passed ? 'PASS' : 'BLOCKED';
  return `# Simulation quality report — representative reasoning gate

## Verdict

- Controlled demo / alpha: ${controlled.passed ? 'PASS' : 'BLOCKED'}
- Full-launch candidate: ${fullVerdict}

## Metrics

| Metric | Value |
|---|---:|
| Total cases | ${m.totalCases} |
| Canonical cases | ${m.canonicalCases} |
| Exact first guess | ${formatPercent(m.exactFirstGuessRate)} |
| Exact final guess | ${formatPercent(m.exactFinalGuessRate)} |
| Top-three at first stop | ${formatPercent(m.top3AtFirstStopRate)} |
| Median first guess turn | ${m.medianFirstGuessTurn} |
| P90 first guess turn | ${m.p90FirstGuessTurn} |
| Max first guess turn | ${m.maxFirstGuessTurn} |
| Branch entropy turn 2 | ${(m.branchEntropyByTurn['1'] ?? 0).toFixed(3)} |
| Branch entropy turn 3 | ${(m.branchEntropyByTurn['2'] ?? 0).toFixed(3)} |
| Branch entropy turn 4 | ${(m.branchEntropyByTurn['3'] ?? 0).toFixed(3)} |
| Unique first-four paths | ${m.uniquePrefix4Count} |
| Average answer trace count | ${m.averageAnswerTraceCount.toFixed(2)} |
| Rationale coverage | ${formatPercent(m.rationaleCoverageRate)} |
| Recovery success | ${formatPercent(m.recoverySuccessRate)} |
| Unknown-heavy graceful behavior | ${formatPercent(m.unknownGracefulRate)} |
| False confidence | ${formatPercent(m.falseConfidenceRate)} |
| Leak-free visible copy | ${m.leakFree ? 'yes' : 'no'} |

## Full-launch failed criteria

${full.failedCriteria.length === 0 ? '- none' : full.failedCriteria.map((item) => `- ${item}`).join('\n')}

## Case summary

${suite.cases.map((result) => `- ${result.caseId}: ${result.finalStatus}, first=${result.firstGuessCandidateId ?? '-'}, final=${result.finalGuessCandidateId ?? '-'}, turn=${result.firstGuessTurn ?? result.finalTurn}, trace=${result.answerTraceCount}, leaks=${result.leakMarkers.length}`).join('\n')}
`;
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
