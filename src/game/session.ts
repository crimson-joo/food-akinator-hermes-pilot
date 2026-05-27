import { FOODS } from '../data/foods';
import { QUESTIONS, type Question } from '../data/questions';
import { applyAnswer, initializePosterior, topCandidates, type Answer, type Posterior } from '../engine/score';
import { selectNextQuestion } from '../engine/selectQuestion';

export type Phase = 'entry' | 'asking' | 'answerAccepted' | 'thinking' | 'guessAnticipation' | 'reveal' | 'correct' | 'wrongRecovery';
export type Session = { phase: Phase; posterior: Posterior; currentQuestion: Question | null; answered: Array<{ questionId: string; answer: Answer }>; suppressedFoodIds: string[]; guess: ReturnType<typeof topCandidates>[number] | null; turn: number };

export function createSession(): Session {
  const posterior = initializePosterior(FOODS);
  return { phase: 'entry', posterior, currentQuestion: selectNextQuestion(posterior, QUESTIONS, new Set()), answered: [], suppressedFoodIds: [], guess: null, turn: 0 };
}

export function startSession(session: Session): Session { return { ...session, phase: 'asking' }; }

export function answerCurrentQuestion(session: Session, answer: Answer): Session {
  const currentQuestion = session.currentQuestion ?? selectNextQuestion(session.posterior, QUESTIONS, new Set(session.answered.map((item) => item.questionId)));
  if (!currentQuestion) return reveal(session);
  const posterior = applyAnswer(session.posterior, currentQuestion, answer);
  const answered = [...session.answered, { questionId: currentQuestion.id, answer }];
  const top = topCandidates(posterior, 1)[0];
  const shouldReveal = answered.length >= 6 && (top.probability >= 0.3 || answered.length >= 12);
  if (shouldReveal) return { ...session, phase: 'reveal', posterior, answered, currentQuestion: null, guess: top, turn: session.turn + 1 };
  const nextQuestion = selectNextQuestion(posterior, QUESTIONS, new Set(answered.map((item) => item.questionId)));
  return { ...session, phase: answered.length % 3 === 0 ? 'thinking' : 'asking', posterior, answered, currentQuestion: nextQuestion, guess: top, turn: session.turn + 1 };
}

function reveal(session: Session): Session { return { ...session, phase: 'reveal', guess: topCandidates(session.posterior, 1)[0] ?? null }; }
export function markGuessCorrect(session: Session): Session { return { ...session, phase: 'correct' }; }
export function markGuessWrong(session: Session): Session {
  const wrongId = session.guess?.food.id;
  const suppressed = wrongId ? [...new Set([...session.suppressedFoodIds, wrongId])] : session.suppressedFoodIds;
  let posterior = { ...session.posterior };
  if (wrongId) delete posterior[wrongId];
  const total = Object.values(posterior).reduce((sum, value) => sum + value, 0) || 1;
  posterior = Object.fromEntries(Object.entries(posterior).map(([id, value]) => [id, value / total]));
  const currentQuestion = selectNextQuestion(posterior, QUESTIONS, new Set(session.answered.map((item) => item.questionId)));
  return { ...session, phase: 'wrongRecovery', suppressedFoodIds: suppressed, posterior, currentQuestion, guess: topCandidates(posterior, 1)[0] ?? null };
}
export function restartSession(_session?: Session): Session { return createSession(); }
