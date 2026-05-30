import { ANSWER_VALUES, type AnswerKey, type Candidate, type Question } from './domain.js';
import { scoreCandidates, type AnsweredQuestion, type CandidateScore } from './scoring.js';
import { selectNextQuestion } from './selector.js';

export type SessionStatus = 'asking' | 'confident' | 'revealed' | 'exhausted';
export type CharacterCue = 'ask' | 'confident' | 'reveal' | 'recover' | 'exhausted';

export type RevealPolicy = {
  confidenceThreshold: number;
  marginThreshold: number;
  softCapTurn: number;
  softCapConfidence: number;
  hardCapTurn: number;
  minRevealTurn: number;
  maxUnknownBeforeExhausted: number;
};

export type RevealGuess = {
  candidate: Candidate;
  reasonSeeds: string[];
};

export type EngineSession = {
  status: SessionStatus;
  characterCue: CharacterCue;
  turn: number;
  answers: AnsweredQuestion[];
  currentQuestion?: Question | undefined;
  answerOptions: AnswerKey[];
  candidateScores: CandidateScore[];
  rejectedCandidateIds: string[];
  lastGuessCandidateId?: string | undefined;
  unknownStreak: number;
  totalUnknownCount: number;
  topCandidate?: Candidate | undefined;
  guess?: RevealGuess | undefined;
  rankingPreview: { candidateId: string; nameKo: string; probability: number }[];
  copy: {
    headlineKo: string;
    helperKo?: string;
  };
  canAnswer: boolean;
  canConfirmGuess: boolean;
  canRejectGuess: boolean;
  policy: RevealPolicy;
};

export type SessionDataset = {
  candidates: Candidate[];
  questions: Question[];
};

const DEFAULT_POLICY: RevealPolicy = {
  confidenceThreshold: 0.72,
  marginThreshold: 0.18,
  softCapTurn: 10,
  softCapConfidence: 0.55,
  hardCapTurn: 14,
  minRevealTurn: 5,
  maxUnknownBeforeExhausted: 5,
};

const ANSWER_OPTIONS: readonly AnswerKey[] = ['yes', 'probably', 'unknown', 'probably_not', 'no'];

function answerOptions(): AnswerKey[] {
  return [...ANSWER_OPTIONS];
}

export function startSession(dataset: SessionDataset, options: Partial<RevealPolicy> = {}): EngineSession {
  const policy = { ...DEFAULT_POLICY, ...options };
  return buildNextSession({
    dataset,
    answers: [],
    rejectedCandidateIds: [],
    unknownStreak: 0,
    totalUnknownCount: 0,
    policy,
  });
}

export function submitAnswer(
  session: EngineSession,
  input: { questionId: string; answer: AnswerKey },
  dataset: SessionDataset,
): EngineSession {
  if (!session.currentQuestion || session.status === 'revealed' || session.status === 'exhausted') {
    throw new Error('No current question is available for answering');
  }

  if (session.answers.some((answer) => answer.questionId === input.questionId)) {
    throw new Error(`Question ${input.questionId} is already answered`);
  }

  if (input.questionId !== session.currentQuestion.id) {
    throw new Error(`Answer must target the current question ${session.currentQuestion.id}`);
  }

  if (!ANSWER_OPTIONS.includes(input.answer)) {
    throw new Error(`Unknown answer key: ${input.answer}`);
  }

  const answers = [...session.answers, { questionId: input.questionId, answer: input.answer }];
  const unknownStreak = input.answer === 'unknown' ? session.unknownStreak + 1 : 0;
  const totalUnknownCount = input.answer === 'unknown' ? session.totalUnknownCount + 1 : session.totalUnknownCount;

  return buildNextSession({
    dataset,
    answers,
    rejectedCandidateIds: session.rejectedCandidateIds,
    unknownStreak,
    totalUnknownCount,
    policy: session.policy,
  });
}

export function submitGuessFeedback(
  session: EngineSession,
  input: { candidateId: string; accepted: boolean },
  dataset: SessionDataset,
): EngineSession {
  if (!session.guess || session.guess.candidate.id !== input.candidateId) {
    throw new Error('Guess feedback must target the current guess');
  }

  if (input.accepted) {
    return {
      ...session,
      status: 'revealed',
      characterCue: 'reveal',
      canAnswer: false,
      canConfirmGuess: false,
      canRejectGuess: false,
    };
  }

  const rejectedCandidateIds = Array.from(new Set([...session.rejectedCandidateIds, input.candidateId]));
  return buildNextSession({
    dataset,
    answers: session.answers,
    rejectedCandidateIds,
    unknownStreak: session.unknownStreak,
    totalUnknownCount: session.totalUnknownCount,
    policy: session.policy,
    recovery: true,
  });
}

type BuildInput = {
  dataset: SessionDataset;
  answers: AnsweredQuestion[];
  rejectedCandidateIds: string[];
  unknownStreak: number;
  totalUnknownCount: number;
  policy: RevealPolicy;
  recovery?: boolean;
};

function buildNextSession(input: BuildInput): EngineSession {
  const activeCandidates = input.dataset.candidates.filter(
    (candidate) => candidate.status === 'active' && !input.rejectedCandidateIds.includes(candidate.id),
  );
  const candidateScores = scoreCandidates(activeCandidates, input.answers);
  const probabilities = normalizeProbabilities(candidateScores);
  const [top, runnerUp] = probabilities;
  const topCandidate = top?.score.candidate;
  const answeredCount = input.answers.length;
  const turn = answeredCount + 1;

  if (activeCandidates.length === 0 || !topCandidate) {
    return exhausted(input, candidateScores, probabilities, '더 볼 수 있는 후보가 남아 있지 않아요.');
  }

  if (input.totalUnknownCount >= input.policy.maxUnknownBeforeExhausted) {
    return exhausted(input, candidateScores, probabilities, '단서가 너무 적어서 찍지 않을게요. 다시 시작하거나 마음속 기준을 하나만 정해볼까요?');
  }

  const margin = top.probability - (runnerUp?.probability ?? 0);
  const allEvidenceUnknown = input.answers.length > 0 && input.answers.every((answer) => answer.answer === 'unknown');
  const eligibleSelection = pickNextQuestion(input, candidateScores);
  const shouldRevealByConfidence = answeredCount >= input.policy.minRevealTurn
    && top.probability >= input.policy.confidenceThreshold
    && margin >= input.policy.marginThreshold;
  const shouldRevealBySoftCap = answeredCount >= input.policy.softCapTurn
    && top.probability >= input.policy.softCapConfidence
    && !allEvidenceUnknown;
  const hardCapReached = answeredCount >= input.policy.hardCapTurn;

  if (input.recovery && eligibleSelection) {
    return askingSession(input, candidateScores, probabilities, topCandidate, eligibleSelection.question, true);
  }

  if ((shouldRevealByConfidence || shouldRevealBySoftCap || hardCapReached) && !allEvidenceUnknown) {
    return revealed(input, candidateScores, probabilities, topCandidate);
  }

  if (!eligibleSelection || hardCapReached) {
    return exhausted(input, candidateScores, probabilities, '단서가 충분하지 않아 확신해서 말하지 않을게요. 다시 시작해볼까요?');
  }

  return askingSession(input, candidateScores, probabilities, topCandidate, eligibleSelection.question, false);
}

function askingSession(
  input: BuildInput,
  candidateScores: CandidateScore[],
  probabilities: ProbabilityScore[],
  topCandidate: Candidate,
  currentQuestion: Question,
  recovery: boolean,
): EngineSession {
  const topProbability = probabilities[0]?.probability ?? 0;
  const status: SessionStatus = recovery ? 'asking' : input.answers.length >= 1 && topProbability >= 0.5 ? 'confident' : 'asking';
  const characterCue: CharacterCue = recovery ? 'recover' : status === 'confident' ? 'confident' : 'ask';

  return {
    status,
    characterCue,
    turn: input.answers.length + 1,
    answers: input.answers,
    currentQuestion,
    answerOptions: answerOptions(),
    candidateScores,
    rejectedCandidateIds: input.rejectedCandidateIds,
    unknownStreak: input.unknownStreak,
    totalUnknownCount: input.totalUnknownCount,
    topCandidate,
    rankingPreview: probabilities.map(({ score, probability }) => ({
      candidateId: score.candidate.id,
      nameKo: score.candidate.nameKo,
      probability,
    })),
    copy: recovery
      ? { headlineKo: '좋아요, 그건 빼고 다시 볼게요.', helperKo: currentQuestion.textKo }
      : status === 'confident'
        ? { headlineKo: '큰 갈래는 잡혔어요.', helperKo: currentQuestion.textKo }
        : { headlineKo: currentQuestion.textKo },
    canAnswer: true,
    canConfirmGuess: false,
    canRejectGuess: false,
    policy: input.policy,
  };
}

function pickNextQuestion(input: BuildInput, candidateScores: CandidateScore[]) {
  const activeQuestions = input.dataset.questions.filter((question) => question.status === 'active');
  const recoveryLowRisk = input.recovery
    ? activeQuestions.find((question) => question.role === 'recovery_disambiguation' && question.revealRisk <= 1 && !input.answers.some((answer) => answer.questionId === question.id))
    : undefined;

  if (recoveryLowRisk) {
    return { question: recoveryLowRisk };
  }

  return selectNextQuestion({
    candidates: input.dataset.candidates,
    questions: input.dataset.questions,
    answers: input.answers,
    turn: input.answers.length + 1,
    candidateScores,
    rejectedCandidateIds: input.rejectedCandidateIds,
  });
}

function revealed(
  input: BuildInput,
  candidateScores: CandidateScore[],
  probabilities: ProbabilityScore[],
  candidate: Candidate,
): EngineSession {
  const helperKo = candidate.reveal.reasonSeeds.slice(0, 3).join(', ');
  return {
    status: 'revealed',
    characterCue: 'reveal',
    turn: input.answers.length + 1,
    answers: input.answers,
    answerOptions: answerOptions(),
    candidateScores,
    rejectedCandidateIds: input.rejectedCandidateIds,
    lastGuessCandidateId: candidate.id,
    unknownStreak: input.unknownStreak,
    totalUnknownCount: input.totalUnknownCount,
    topCandidate: candidate,
    guess: { candidate, reasonSeeds: candidate.reveal.reasonSeeds },
    rankingPreview: probabilities.map(({ score, probability }) => ({
      candidateId: score.candidate.id,
      nameKo: score.candidate.nameKo,
      probability,
    })),
    copy: {
      headlineKo: `${candidate.nameKo}, 이걸로 볼게요.`,
      helperKo: helperKo.length > 0 ? helperKo : candidate.reveal.oneLiner,
    },
    canAnswer: false,
    canConfirmGuess: true,
    canRejectGuess: true,
    policy: input.policy,
  };
}

function exhausted(
  input: BuildInput,
  candidateScores: CandidateScore[],
  probabilities: ProbabilityScore[],
  headlineKo: string,
): EngineSession {
  return {
    status: 'exhausted',
    characterCue: 'exhausted',
    turn: input.answers.length + 1,
    answers: input.answers,
    answerOptions: answerOptions(),
    candidateScores,
    rejectedCandidateIds: input.rejectedCandidateIds,
    unknownStreak: input.unknownStreak,
    totalUnknownCount: input.totalUnknownCount,
    topCandidate: probabilities[0]?.score.candidate,
    rankingPreview: probabilities.map(({ score, probability }) => ({
      candidateId: score.candidate.id,
      nameKo: score.candidate.nameKo,
      probability,
    })),
    copy: { headlineKo },
    canAnswer: false,
    canConfirmGuess: false,
    canRejectGuess: false,
    policy: input.policy,
  };
}

type ProbabilityScore = {
  score: CandidateScore;
  probability: number;
};

function normalizeProbabilities(scores: CandidateScore[]): ProbabilityScore[] {
  if (scores.length === 0) {
    return [];
  }

  const safeScores = scores.map((score) => Number.isFinite(score.score) ? score.score : 0);
  const maxScore = Math.max(...safeScores);
  const exponentials = safeScores.map((score) => Math.exp(score - maxScore));
  const total = exponentials.reduce((sum, value) => sum + value, 0);

  if (!Number.isFinite(total) || total <= 0) {
    const probability = 1 / scores.length;
    return scores.map((score) => ({ score, probability }));
  }

  return scores.map((score, index) => ({ score, probability: exponentials[index]! / total }));
}
