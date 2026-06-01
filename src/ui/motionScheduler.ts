import type { AnswerKey } from '../engine/domain.js';
import type { RecoveryBeat, UiEvent } from './app.js';

export const motionDurations = {
  answerAcceptedMs: 700,
  thinkingTotalMs: 1550,
  recoveryRemoveMs: 520,
  recoveryRefocusMs: 1040,
  recoveryReturnMs: 1760,
} as const;

export type ScheduledUiEvent =
  | UiEvent
  | { type: 'engineReadyFromAnswer'; questionId: string; answer: AnswerKey }
  | { type: 'advanceRecoveryBeatFromGuess'; beat: Extract<RecoveryBeat, 'refocus'>; candidateId: string }
  | { type: 'completeRecovery' };

export type MotionTransition = {
  afterMs: number;
  event: ScheduledUiEvent;
};

export type SchedulerClock = {
  setTimeout(callback: () => void, delayMs: number): unknown;
};

export function planAnswerMotion(input: { questionId: string; answer: AnswerKey }): MotionTransition[] {
  return [
    { afterMs: 0, event: { type: 'answer', answer: input.answer } },
    { afterMs: motionDurations.answerAcceptedMs, event: { type: 'thinking' } },
    { afterMs: motionDurations.thinkingTotalMs, event: { type: 'engineReadyFromAnswer', questionId: input.questionId, answer: input.answer } },
  ];
}

export function planWrongRecoveryMotion(input: { candidateId: string; candidateName: string }): MotionTransition[] {
  return [
    { afterMs: 0, event: { type: 'rejectGuess', candidateId: input.candidateId, candidateName: input.candidateName } },
    { afterMs: motionDurations.recoveryRemoveMs, event: { type: 'advanceRecoveryBeat', beat: 'remove' } },
    { afterMs: motionDurations.recoveryRefocusMs, event: { type: 'advanceRecoveryBeatFromGuess', beat: 'refocus', candidateId: input.candidateId } },
    { afterMs: motionDurations.recoveryReturnMs, event: { type: 'completeRecovery' } },
  ];
}

export function runMotionPlan(clock: SchedulerClock, dispatch: (event: ScheduledUiEvent) => void, plan: readonly MotionTransition[]): void {
  for (const transition of plan) {
    clock.setTimeout(() => dispatch(transition.event), transition.afterMs);
  }
}
