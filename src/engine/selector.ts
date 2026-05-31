import type { Candidate, Question, QuestionRole } from './domain.js';
import { scoreCandidates, type AnsweredQuestion, type CandidateScore } from './scoring.js';

export type SelectorContext = {
  candidates: Candidate[];
  questions: Question[];
  answers: AnsweredQuestion[];
  turn: number;
  candidateScores?: CandidateScore[];
  rejectedCandidateIds?: string[];
};

export type QuestionSelection = {
  question: Question;
  score: number;
  reasons: string[];
};

type WeightedCandidate = {
  candidate: Candidate;
  weight: number;
};

const COST_PENALTY = 0.03;
const EARLY_BROAD_SPLIT_BONUS = 0.2;
const ROLE_FOLLOWUP_BONUS = 0.12;
const UNKNOWN_CLARITY_BONUS = 0.03;
const UNKNOWN_RECOVERY_ROLE_BONUS = 0.6;
const ANSWER_ALIGNED_FOLLOWUP_BONUS = 0.45;

const FOLLOWUP_ROLES = new Set<QuestionRole>([
  'signature_discriminator',
  'sibling_elimination',
  'false_path_guardrail',
]);

export function rankNextQuestions(context: SelectorContext): QuestionSelection[] {
  const activeCandidates = getActiveCandidates(context);
  if (activeCandidates.length === 0) {
    return [];
  }

  const eligibleQuestions = getEligibleQuestions(context.questions, context.answers, context.turn);
  if (eligibleQuestions.length === 0) {
    return [];
  }

  const weightedCandidates = normalizeWeights(activeCandidates, context.answers, context.candidateScores);
  if (weightedCandidates.length === 0) {
    return [];
  }

  const lastAnswer = context.answers.at(-1);
  const lastAnswerWasUnknown = lastAnswer?.answer === 'unknown';
  const topCandidate = weightedCandidates.reduce((top, current) => current.weight > top.weight ? current : top).candidate;
  const plausibleCandidateCount = weightedCandidates.length;

  return eligibleQuestions
    .map((question, index) => ({
      ...scoreQuestion(
        question,
        weightedCandidates,
        context.turn,
        plausibleCandidateCount,
        lastAnswerWasUnknown,
        context.answers.length > 0,
        (context.rejectedCandidateIds?.length ?? 0) > 0,
        topCandidate,
      ),
      index,
    }))
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map(({ index: _index, ...selection }) => selection);
}

export function selectNextQuestion(context: SelectorContext): QuestionSelection | null {
  return rankNextQuestions(context)[0] ?? null;
}

function getActiveCandidates(context: SelectorContext): Candidate[] {
  const rejected = new Set(context.rejectedCandidateIds ?? []);
  return context.candidates.filter((candidate) => candidate.status === 'active' && !rejected.has(candidate.id));
}

function getEligibleQuestions(questions: Question[], answers: AnsweredQuestion[], turn: number): Question[] {
  const answeredIds = new Set(answers.map((answer) => answer.questionId));
  const activeUnanswered = questions.filter(
    (question) => question.status === 'active' && !answeredIds.has(question.id),
  );
  const lastAnswerWasUnknown = answers.at(-1)?.answer === 'unknown';

  if (turn > 3 && !lastAnswerWasUnknown) {
    return activeUnanswered;
  }

  const saferQuestions = activeUnanswered.filter((question) => question.revealRisk < 3);
  return saferQuestions.length > 0 ? saferQuestions : activeUnanswered;
}

function normalizeWeights(
  candidates: Candidate[],
  answers: AnsweredQuestion[],
  injectedScores?: CandidateScore[],
): WeightedCandidate[] {
  const candidateIds = new Set(candidates.map((candidate) => candidate.id));
  const scoreByCandidateId = new Map(
    (injectedScores ?? scoreCandidates(candidates, answers))
      .filter(({ candidate }) => candidateIds.has(candidate.id))
      .map(({ candidate, score }) => [candidate.id, Number.isFinite(score) ? score : 0]),
  );

  const scores = candidates.map((candidate) => scoreByCandidateId.get(candidate.id) ?? 0);
  const maxScore = Math.max(...scores);
  const exponentials = scores.map((score) => Math.exp(score - maxScore));
  const total = exponentials.reduce((sum, value) => sum + value, 0);

  if (!Number.isFinite(total) || total <= 0) {
    return [];
  }

  return candidates.map((candidate, index) => ({
    candidate,
    weight: exponentials[index]! / total,
  }));
}

function scoreQuestion(
  question: Question,
  weightedCandidates: WeightedCandidate[],
  turn: number,
  plausibleCandidateCount: number,
  lastAnswerWasUnknown: boolean,
  hasAnswers: boolean,
  hasRejectedCandidates: boolean,
  topCandidate: Candidate,
): QuestionSelection {
  const split = weightedVariance(question.id, weightedCandidates);
  const policy = policyBonus(
    question,
    turn,
    plausibleCandidateCount,
    lastAnswerWasUnknown,
    hasAnswers,
    hasRejectedCandidates,
    topCandidate,
  );
  const costPenalty = COST_PENALTY * Math.max(0, question.cost);
  const score = split + policy.value - costPenalty;

  const reasons = [`split:${round(split)}`, `costPenalty:${round(costPenalty)}`, ...policy.reasons];
  return { question, score, reasons };
}

function weightedVariance(questionId: string, weightedCandidates: WeightedCandidate[]): number {
  const mean = weightedCandidates.reduce(
    (sum, { candidate, weight }) => sum + weight * (candidate.attributes[questionId] ?? 0),
    0,
  );

  return weightedCandidates.reduce((sum, { candidate, weight }) => {
    const expected = candidate.attributes[questionId] ?? 0;
    return sum + weight * (expected - mean) ** 2;
  }, 0);
}

function policyBonus(
  question: Question,
  turn: number,
  plausibleCandidateCount: number,
  lastAnswerWasUnknown: boolean,
  hasAnswers: boolean,
  hasRejectedCandidates: boolean,
  topCandidate: Candidate,
): { value: number; reasons: string[] } {
  let value = 0;
  const reasons: string[] = [];

  if (turn <= 3 && question.role === 'broad_split' && !lastAnswerWasUnknown) {
    value += EARLY_BROAD_SPLIT_BONUS;
    reasons.push('earlyBroadSplit');
  }

  if (turn > 3 && plausibleCandidateCount >= 2 && plausibleCandidateCount <= 4 && FOLLOWUP_ROLES.has(question.role)) {
    value += ROLE_FOLLOWUP_BONUS;
    reasons.push('narrowFollowup');
  }

  if (turn <= 3 && hasAnswers && (topCandidate.attributes[question.id] ?? 0) > 0.5) {
    value += ANSWER_ALIGNED_FOLLOWUP_BONUS;
    reasons.push('answerAlignedFollowup');
  }

  if (hasRejectedCandidates && question.role === 'recovery_disambiguation') {
    value += ROLE_FOLLOWUP_BONUS;
    reasons.push('rejectedRecovery');
  }

  if (lastAnswerWasUnknown) {
    const clarityBonus = UNKNOWN_CLARITY_BONUS * question.clarity;
    value += clarityBonus;
    reasons.push(`unknownClarity:${round(clarityBonus)}`);

    if (question.role === 'recovery_disambiguation') {
      value += UNKNOWN_RECOVERY_ROLE_BONUS;
      reasons.push('unknownRecovery');
    }
  }

  return { value, reasons };
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}
