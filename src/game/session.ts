import { FOODS } from '../data/foods';
import { QUESTIONS, type Question } from '../data/questions';
import { applyAnswer, initializePosterior, topCandidates, type Answer, type Posterior } from '../engine/score';
import { selectNextQuestion } from '../engine/selectQuestion';

export type Phase = 'entry' | 'asking' | 'answerAccepted' | 'thinking' | 'guessAnticipation' | 'reveal' | 'correct' | 'wrongRecovery';
export type Session = {
  phase: Phase;
  posterior: Posterior;
  currentQuestion: Question | null;
  answered: Array<{ questionId: string; answer: Answer }>;
  suppressedFoodIds: string[];
  guess: ReturnType<typeof topCandidates>[number] | null;
  turn: number;
  lastRejectedGuess?: string;
  actualAnswerNote?: string;
};

export type RevealReadiness = { canReveal: boolean; confidence: number; gap: number; answeredCount: number; reason: 'too-early' | 'confident' | 'max-turns' | 'no-question' };

export function createSession(): Session {
  const posterior = initializePosterior(FOODS);
  return { phase: 'entry', posterior, currentQuestion: selectNextQuestion(posterior, QUESTIONS, new Set()), answered: [], suppressedFoodIds: [], guess: null, turn: 0 };
}

export function startSession(session: Session): Session { return { ...session, phase: 'asking' }; }

export function revealReadiness(session: Session): RevealReadiness {
  const [first, second] = topCandidates(session.posterior, 2);
  const confidence = first?.probability ?? 0;
  const gap = confidence - (second?.probability ?? 0);
  const answeredCount = session.answered.length;
  if (!session.currentQuestion) return { canReveal: true, confidence, gap, answeredCount, reason: 'no-question' };
  if (answeredCount >= 12) return { canReveal: true, confidence, gap, answeredCount, reason: 'max-turns' };
  if (answeredCount >= 6 && confidence >= 0.34 && gap >= 0.08) return { canReveal: true, confidence, gap, answeredCount, reason: 'confident' };
  return { canReveal: false, confidence, gap, answeredCount, reason: 'too-early' };
}

export function answerCurrentQuestion(session: Session, answer: Answer): Session {
  const answeredIds = new Set(session.answered.map((item) => item.questionId));
  const currentQuestion = session.currentQuestion ?? selectNextQuestion(session.posterior, QUESTIONS, answeredIds);
  if (!currentQuestion) return reveal(session);
  const posterior = applyAnswer(session.posterior, currentQuestion, answer);
  const answered = [...session.answered, { questionId: currentQuestion.id, answer }];
  const nextQuestion = selectNextQuestion(posterior, QUESTIONS, new Set(answered.map((item) => item.questionId)));
  const candidateSession = { ...session, posterior, answered, currentQuestion: nextQuestion, guess: topCandidates(posterior, 1)[0] ?? null, turn: session.turn + 1 };
  const readiness = revealReadiness(candidateSession);
  if (readiness.canReveal) return { ...candidateSession, phase: 'reveal', currentQuestion: null };
  if (answered.length >= 5 && readiness.confidence >= 0.28) return { ...candidateSession, phase: 'guessAnticipation' };
  return { ...candidateSession, phase: answered.length % 3 === 0 ? 'thinking' : 'asking' };
}

function reveal(session: Session): Session { return { ...session, phase: 'reveal', guess: topCandidates(session.posterior, 1)[0] ?? null, currentQuestion: null }; }
export function markGuessCorrect(session: Session): Session { return { ...session, phase: 'correct' }; }
export function markGuessWrong(session: Session, actualAnswerNote = ''): Session {
  const wrongId = session.guess?.food.id;
  const suppressed = wrongId ? [...new Set([...session.suppressedFoodIds, wrongId])] : session.suppressedFoodIds;
  let posterior = { ...session.posterior };
  if (wrongId) delete posterior[wrongId];
  const total = Object.values(posterior).reduce((sum, value) => sum + value, 0) || 1;
  posterior = Object.fromEntries(Object.entries(posterior).map(([id, value]) => [id, value / total]));
  const currentQuestion = selectNextQuestion(posterior, QUESTIONS, new Set(session.answered.map((item) => item.questionId)));
  return { ...session, phase: 'wrongRecovery', suppressedFoodIds: suppressed, posterior, currentQuestion, guess: topCandidates(posterior, 1)[0] ?? null, lastRejectedGuess: wrongId, actualAnswerNote };
}
export function restartSession(_session?: Session): Session { return createSession(); }
