import { describe, expect, it } from 'vitest';
import { motionDurations, planAnswerMotion, planWrongRecoveryMotion, runMotionPlan, type MotionTransition } from '../src/ui/motionScheduler.js';

describe('UI motion scheduler', () => {
  it('plans answer acknowledgement, thinking, and engine-ready timings without real timers', () => {
    const plan = planAnswerMotion({ questionId: 'q-broth', answer: 'yes' });

    expect(motionDurations.answerAcceptedMs).toBe(700);
    expect(motionDurations.thinkingTotalMs).toBe(1550);
    expect(plan).toEqual<MotionTransition[]>([
      { afterMs: 0, event: { type: 'answer', answer: 'yes' } },
      { afterMs: 700, event: { type: 'thinking' } },
      { afterMs: 1550, event: { type: 'engineReadyFromAnswer', questionId: 'q-broth', answer: 'yes' } },
    ]);
  });

  it('plans the three wrong-recovery beats deterministically', () => {
    const plan = planWrongRecoveryMotion({ candidateId: 'kimchi-jjigae', candidateName: '김치찌개' });

    expect(motionDurations.recoveryRemoveMs).toBe(520);
    expect(motionDurations.recoveryRefocusMs).toBe(1040);
    expect(motionDurations.recoveryReturnMs).toBe(1760);
    expect(plan).toEqual<MotionTransition[]>([
      { afterMs: 0, event: { type: 'rejectGuess', candidateId: 'kimchi-jjigae', candidateName: '김치찌개' } },
      { afterMs: 520, event: { type: 'advanceRecoveryBeat', beat: 'remove' } },
      { afterMs: 1040, event: { type: 'advanceRecoveryBeatFromGuess', beat: 'refocus', candidateId: 'kimchi-jjigae' } },
      { afterMs: 1760, event: { type: 'completeRecovery' } },
    ]);
  });

  it('runs plans against an injectable fake clock in scheduled order', () => {
    const scheduled: Array<{ delayMs: number; callback: () => void }> = [];
    const events: MotionTransition['event'][] = [];

    runMotionPlan({ setTimeout: (callback, delayMs) => scheduled.push({ callback, delayMs }) }, (event) => events.push(event), planAnswerMotion({ questionId: 'q-spicy', answer: 'no' }));

    expect(scheduled.map((item) => item.delayMs)).toEqual([0, 700, 1550]);
    scheduled.forEach((item) => item.callback());
    expect(events).toEqual([
      { type: 'answer', answer: 'no' },
      { type: 'thinking' },
      { type: 'engineReadyFromAnswer', questionId: 'q-spicy', answer: 'no' },
    ]);
  });
});
