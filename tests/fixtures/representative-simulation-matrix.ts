import type { AnswerKey } from '../../src/engine/domain.js';

export type SimulationAnswerStrategy =
  | 'canonicalAttributes'
  | 'mixedUncertainty'
  | 'unknownHeavy'
  | 'rejectedGuessRecovery';

export type RepresentativeSimulationCase = {
  id: string;
  targetCandidateId: string;
  cohort: 'soup_stew' | 'noodle' | 'rice_bowl' | 'snack' | 'fried' | 'western' | 'chinese' | 'edge';
  strategy: SimulationAnswerStrategy;
  expected?: {
    maxFirstGuessTurn?: number;
    minAnswerTraceCount?: number;
    allowWrongFirstGuess?: boolean;
    expectedRecoveryQuestionRole?: 'recovery_disambiguation';
    unknownAnswersBeforeStop?: number;
  };
};

const canonicalTargets = [
  ['kimchi-jjigae', 'soup_stew'],
  ['doenjang-jjigae', 'soup_stew'],
  ['budae-jjigae', 'soup_stew'],
  ['sundubu-jjigae', 'soup_stew'],
  ['seolleongtang', 'edge'],
  ['haejangguk', 'soup_stew'],
  ['ramyeon', 'noodle'],
  ['janchi-guksu', 'noodle'],
  ['naengmyeon', 'noodle'],
  ['bibimbap', 'rice_bowl'],
  ['kimchi-fried-rice', 'rice_bowl'],
  ['jeyuk-deopbap', 'rice_bowl'],
  ['tteokbokki', 'snack'],
  ['gimbap', 'snack'],
  ['fried-chicken', 'fried'],
  ['donkatsu', 'fried'],
  ['pizza', 'western'],
  ['hamburger', 'western'],
  ['jajangmyeon', 'chinese'],
  ['jjambbong', 'chinese'],
] as const;

export const representativeSimulationCases: RepresentativeSimulationCase[] = [
  ...canonicalTargets.map(([targetCandidateId, cohort]) => ({
    id: `canonical-${targetCandidateId}`,
    targetCandidateId,
    cohort,
    strategy: 'canonicalAttributes' as const,
    expected: {
      maxFirstGuessTurn: 15,
      minAnswerTraceCount: 2,
      allowWrongFirstGuess: targetCandidateId === 'seolleongtang',
    },
  })),
  { id: 'mixed-uncertainty-kimchi-jjigae', targetCandidateId: 'kimchi-jjigae', cohort: 'soup_stew', strategy: 'mixedUncertainty' },
  { id: 'mixed-uncertainty-ramyeon', targetCandidateId: 'ramyeon', cohort: 'noodle', strategy: 'mixedUncertainty' },
  { id: 'mixed-uncertainty-fried-chicken', targetCandidateId: 'fried-chicken', cohort: 'fried', strategy: 'mixedUncertainty' },
  { id: 'mixed-uncertainty-jjambbong', targetCandidateId: 'jjambbong', cohort: 'chinese', strategy: 'mixedUncertainty' },
  {
    id: 'unknown-heavy-bibimbap',
    targetCandidateId: 'bibimbap',
    cohort: 'rice_bowl',
    strategy: 'unknownHeavy',
    expected: { unknownAnswersBeforeStop: 5 },
  },
  {
    id: 'unknown-heavy-tteokbokki',
    targetCandidateId: 'tteokbokki',
    cohort: 'snack',
    strategy: 'unknownHeavy',
    expected: { unknownAnswersBeforeStop: 5 },
  },
  {
    id: 'unknown-heavy-pizza',
    targetCandidateId: 'pizza',
    cohort: 'western',
    strategy: 'unknownHeavy',
    expected: { unknownAnswersBeforeStop: 5 },
  },
  {
    id: 'unknown-heavy-seolleongtang',
    targetCandidateId: 'seolleongtang',
    cohort: 'edge',
    strategy: 'unknownHeavy',
    expected: { unknownAnswersBeforeStop: 5 },
  },
  {
    id: 'recovery-soup-kimchi-jjigae',
    targetCandidateId: 'kimchi-jjigae',
    cohort: 'soup_stew',
    strategy: 'rejectedGuessRecovery',
    expected: { expectedRecoveryQuestionRole: 'recovery_disambiguation' },
  },
  {
    id: 'recovery-noodle-ramyeon',
    targetCandidateId: 'ramyeon',
    cohort: 'noodle',
    strategy: 'rejectedGuessRecovery',
    expected: { expectedRecoveryQuestionRole: 'recovery_disambiguation' },
  },
  {
    id: 'recovery-fried-chicken',
    targetCandidateId: 'fried-chicken',
    cohort: 'fried',
    strategy: 'rejectedGuessRecovery',
    expected: { expectedRecoveryQuestionRole: 'recovery_disambiguation' },
  },
  {
    id: 'recovery-chinese-jjambbong',
    targetCandidateId: 'jjambbong',
    cohort: 'chinese',
    strategy: 'rejectedGuessRecovery',
    expected: { expectedRecoveryQuestionRole: 'recovery_disambiguation' },
  },
];

export const CONTROLLED_DEMO_THRESHOLDS = {
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
} as const;

export const FULL_LAUNCH_CANDIDATE_THRESHOLDS = {
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
} as const;
